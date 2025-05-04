from typing import Optional
from matplotlib import pyplot as plt
from typing_extensions import Literal, TypedDict
import yfinance as yf
import pandas as pd
import os  # Add this import for handling file paths

class RetrieveDataMetadata(TypedDict):
    """
    Metadata for retrieving data from Yahoo Finance.
    """
    symbols: list[str]
    start_date: str
    end_date: Optional[str] = None
    interval: Literal["1d", "1wk", "1mo", "1h", "5m", "15m", "30m", "60m", "90m", "1d"]

def load_existing_data(file_path: str) -> pd.DataFrame:
    """
    Load existing data from a CSV file.

    Parameters:
        file_path (str): Path to the CSV file.

    Returns:
        pd.DataFrame: DataFrame containing the loaded data.
    """
    if os.path.exists(file_path):
        return pd.read_csv(file_path, parse_dates=["Date"])
    else:
        return pd.DataFrame(columns=["Date", "Stock Price", "Gold Price", "GBI", "Stock Symbol"])

def calculate_gbi(stock_symbol, start_date, end_date):
    """
    Calculate the Gold-Base-Index (GBI) for a given stock over a range of dates.

    Parameters:
        stock_symbol (str): The stock ticker symbol (e.g., 'AAPL').
        start_date (str): The start date in 'YYYY-MM-DD' format.
        end_date (str): The end date in 'YYYY-MM-DD' format.

    Returns:
        pd.DataFrame: A DataFrame containing the date, stock price, gold price, and GBI.
    """
    # Fetch stock data
    stock_data = yf.download(stock_symbol, start=start_date, end=end_date, auto_adjust=True)
    if stock_data.empty:
        raise ValueError(f"No data found for stock symbol: {stock_symbol}")
    # Fetch gold data (using GLD ETF as a proxy for gold price)
    gold_data = yf.download("GLD", start=start_date, end=end_date, auto_adjust=True)
    if gold_data.empty:
        raise ValueError("No data found for gold (GLD).")
    
    # find the longest common date range
    common_start_date = max(stock_data.index.min(), gold_data.index.min())
    common_end_date = min(stock_data.index.max(), gold_data.index.max())
    stock_data = stock_data[(stock_data.index >= common_start_date) & (stock_data.index <= common_end_date)]
    gold_data = gold_data[(gold_data.index >= common_start_date) & (gold_data.index <= common_end_date)]

    # Merge stock and gold data on the date
    merged_data = pd.DataFrame({
        "Date": stock_data.index,
        "Stock Price": stock_data["Close"].values.reshape(-1),
        "Gold Price": gold_data["Close"].values.reshape(-1)
    }).dropna()


    # Calculate GBI
    merged_data["GBI"] = merged_data["Stock Price"] / merged_data["Gold Price"]

    # Normalize the GBI columns on the first date
    merged_data["GBI"] = merged_data["GBI"] / merged_data["GBI"].iloc[0]

    return merged_data

# Example usage
if __name__ == "__main__":
    # the symbols are saved under symbol.json as a list of strings
    import json
    with open("metadata.json", "r") as f:
        metadata: RetrieveDataMetadata = json.load(f)
    qqq_and_spy = ["QQQ", "SPY"]  # QQQ and SPY symbols

    baselines = ["GLD"] + qqq_and_spy  # Baseline symbols for comparison
    start_date = metadata["start_date"]  # Replace with your desired start date
    today = pd.Timestamp.today().normalize()
    end_date = today  # Replace with your desired end date

    # Add GLD to the list of symbols for baseline comparison
    big_seven_with_gld = metadata["symbols"] + ["GLD"] + qqq_and_spy

    # Create the /data folder if it doesn't exist
    data_folder = os.path.join(os.getcwd(), "assets", "data")
    os.makedirs(data_folder, exist_ok=True)

    # Initialize an empty DataFrame to store all GBI data
    all_gbi_data = load_existing_data(os.path.join(data_folder, "all_gbi_data.csv"))

    for stock_symbol in big_seven_with_gld:
        try:
            print(f"Retrieving data for {stock_symbol}...")
            existing_symbol_data = all_gbi_data[all_gbi_data["Stock Symbol"] == stock_symbol]
            earliest_date = existing_symbol_data["Date"].min() if not existing_symbol_data.empty else None
            latest_date = existing_symbol_data["Date"].max() if not existing_symbol_data.empty else None
            if earliest_date is None and latest_date is None:
                # retrieve the data from start_date to end_date
                print(f"retrieve {stock_symbol} data from {start_date} to {end_date}.")
                gbi_data = calculate_gbi(stock_symbol, start_date, end_date)
                gbi_data["Stock Symbol"] = stock_symbol
                all_gbi_data = pd.concat([all_gbi_data, gbi_data], ignore_index=True)
                continue
            # if the earliest data is before the start date, we can skip it
            if earliest_date and earliest_date < pd.Timestamp(start_date):
                print(f"Skipping {stock_symbol} as data is already available from {earliest_date}.")
                continue
            else:
                print(f"retrieve {stock_symbol} data from {start_date} to {earliest_date}.")
                gbi_data = calculate_gbi(stock_symbol, start_date, earliest_date)
                gbi_data["Stock Symbol"] = stock_symbol
                all_gbi_data = pd.concat([all_gbi_data, gbi_data], ignore_index=True)
            
            if latest_date and latest_date < pd.Timestamp(end_date):
                print(f"retrieve {stock_symbol} data from {latest_date} to {end_date}.")
                gbi_data = calculate_gbi(stock_symbol, latest_date, end_date)
                gbi_data["Stock Symbol"] = stock_symbol
                all_gbi_data = pd.concat([all_gbi_data, gbi_data], ignore_index=True)
            else:
                print(f"Skipping {stock_symbol} as data is already available until {latest_date}.")
                continue
        except ValueError as e:
            print(f"Error for {stock_symbol}: {e}")

    # Save the combined GBI data to a single CSV file
    combined_csv_path = os.path.join(data_folder, "all_gbi_data.csv")
    all_gbi_data.to_csv(combined_csv_path, index=False)
    print(f"Saved all GBI data to {combined_csv_path}")