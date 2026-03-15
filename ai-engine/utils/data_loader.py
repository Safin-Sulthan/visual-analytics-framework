import logging
import pandas as pd

logger = logging.getLogger(__name__)


def load_csv(file_path: str) -> pd.DataFrame:
    """Load a CSV file into a DataFrame.

    Tries multiple encodings and returns an empty DataFrame on failure.
    """
    if not file_path:
        logger.error("No file path provided.")
        return pd.DataFrame()

    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
    for encoding in encodings:
        try:
            df = pd.read_csv(file_path, encoding=encoding)
            logger.info("Loaded '%s' with encoding '%s' (%d rows).", file_path, encoding, len(df))
            return df
        except FileNotFoundError:
            logger.error("File not found: %s", file_path)
            return pd.DataFrame()
        except UnicodeDecodeError:
            continue
        except Exception as exc:
            logger.error("Failed to load '%s': %s", file_path, exc)
            return pd.DataFrame()

    logger.error("Could not decode '%s' with any known encoding.", file_path)
    return pd.DataFrame()
