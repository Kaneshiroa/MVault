import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Query, status

from ..auth import CurrentUserId
from ..schemas import MetadataSearchResponse, MetadataSearchResult


env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

TMDB_READ_ACCESS_TOKEN = os.getenv("TMDB_READ_ACCESS_TOKEN")

if not TMDB_READ_ACCESS_TOKEN:
    raise RuntimeError(
        "TMDB_READ_ACCESS_TOKEN is required in backend/.env."
    )


router = APIRouter(
    prefix="/metadata",
    tags=["metadata"],
)

TMDB_API_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_URL = "https://image.tmdb.org/t/p"
ANILIST_API_URL = "https://graphql.anilist.co"


def tmdb_image_url(path: str | None, size: str) -> str | None:
    """Build a TMDB CDN image URL when TMDB supplied an image path."""

    if not path:
        return None

    return f"{TMDB_IMAGE_URL}/{size}{path}"


def search_anilist(query: str) -> list[MetadataSearchResult]:
    """Search AniList only after TMDB returned no usable results."""

    anilist_query = """
        query ($search: String!) {
          Page(page: 1, perPage: 10) {
            media(search: $search, isAdult: false) {
              id
              type
              title {
                romaji
                english
                native
              }
              startDate {
                year
              }
              description(asHtml: false)
              coverImage {
                large
              }
              bannerImage
            }
          }
        }
    """

    try:
        response = requests.post(
            ANILIST_API_URL,
            json={
                "query": anilist_query,
                "variables": {"search": query},
            },
            timeout=10,
        )
        response.raise_for_status()
    except requests.RequestException as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AniList is unavailable right now. Please try again.",
        ) from error

    payload = response.json()

    if payload.get("errors"):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AniList could not complete that search. Please try again.",
        )

    results = []

    for item in payload.get("data", {}).get("Page", {}).get("media", []):
        title_data = item.get("title", {})
        title = (
            title_data.get("english")
            or title_data.get("romaji")
            or title_data.get("native")
        )

        if not title:
            continue

        media_type = (
            "manga"
            if item.get("type") == "MANGA"
            else "anime"
        )

        year = item.get("startDate", {}).get("year")

        results.append(
            MetadataSearchResult(
                source="anilist",
                source_id=str(item["id"]),
                title=title,
                media_type=media_type,
                release_year=str(year) if year else None,
                overview=item.get("description") or None,
                poster_url=item.get("coverImage", {}).get("large"),
                backdrop_url=item.get("bannerImage"),
            )
        )

    return results


@router.get("/search", response_model=MetadataSearchResponse)
def search_metadata(
    user_id: CurrentUserId,
    query: str = Query(min_length=2, max_length=100),
):
    """
    Search TMDB first. If it has no movie or series results, use AniList
    as the anime/manga fallback.
    """

    try:
        response = requests.get(
            f"{TMDB_API_URL}/search/multi",
            params={
                "query": query,
                "include_adult": "false",
                "language": "en-US",
            },
            headers={
                "Authorization": f"Bearer {TMDB_READ_ACCESS_TOKEN}",
                "accept": "application/json",
            },
            timeout=10,
        )
        response.raise_for_status()
    except requests.RequestException as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="TMDB is unavailable right now. Please try again.",
        ) from error

    results = []

    for item in response.json().get("results", []):
        media_type = item.get("media_type")

        if media_type not in {"movie", "tv"}:
            continue

        title = item.get("title") or item.get("name")

        if not title:
            continue

        date = item.get("release_date") or item.get("first_air_date") or ""

        results.append(
            MetadataSearchResult(
                source="tmdb",
                source_id=str(item["id"]),
                title=title,
                media_type=media_type,
                release_year=date[:4] or None,
                overview=item.get("overview") or None,
                poster_url=tmdb_image_url(
                    item.get("poster_path"),
                    "w342",
                ),
                backdrop_url=tmdb_image_url(
                    item.get("backdrop_path"),
                    "w1280",
                ),
            )
        )

    if not results:
        results = search_anilist(query)

    return MetadataSearchResponse(results=results)