from matplotlib import pyplot as plt
import yfinance as yf
import pandas as pd
import os  # Add this import for handling file paths

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
    stock_data = yf.download(stock_symbol, start=start_date, end=end_date, auto_adjust=False)
    if stock_data.empty:
        raise ValueError(f"No data found for stock symbol: {stock_symbol}")
    # Fetch gold data (using GLD ETF as a proxy for gold price)
    gold_data = yf.download("GLD", start=start_date, end=end_date, auto_adjust=False)
    if gold_data.empty:
        raise ValueError("No data found for gold (GLD).")

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
    big_seven = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA"]  # Big seven stock symbols
    qqq_and_spy = ["QQQ", "SPY"]  # QQQ and SPY symbols

    baselines = ["GLD"] + qqq_and_spy  # Baseline symbols for comparison
    start_date = "2023-01-01"  # Replace with your desired start date
    today = pd.Timestamp.today().normalize()
    end_date = today  # Replace with your desired end date

    plt.figure(figsize=(12, 8))  # Set the figure size

    # Add GLD to the list of symbols for baseline comparison
    big_seven_with_gld = big_seven + ["GLD"] + qqq_and_spy

    # Create the /data folder if it doesn't exist
    data_folder = os.path.join(os.getcwd(), "assets", "data")
    os.makedirs(data_folder, exist_ok=True)

    # Initialize an empty DataFrame to store all GBI data
    all_gbi_data = pd.DataFrame()

    for stock_symbol in big_seven_with_gld:
        try:
            print(f"Calculating GBI for {stock_symbol}...")
            gbi_data = calculate_gbi(stock_symbol, start_date, end_date)

            # Add a column for the stock symbol
            gbi_data["Stock Symbol"] = stock_symbol

            # Append the data to the combined DataFrame
            all_gbi_data = pd.concat([all_gbi_data, gbi_data], ignore_index=True)

            # Plot the GBI data
            if stock_symbol in baselines:
                plt.plot(gbi_data["Date"], gbi_data["GBI"], label=f"{stock_symbol} (Baseline)", linewidth=2.5)
            else:
                plt.plot(gbi_data["Date"], gbi_data["GBI"], label=stock_symbol)
        except ValueError as e:
            print(f"Error for {stock_symbol}: {e}")

    # Save the combined GBI data to a single CSV file
    combined_csv_path = os.path.join(data_folder, "all_gbi_data.csv")
    all_gbi_data.to_csv(combined_csv_path, index=False)
    print(f"Saved all GBI data to {combined_csv_path}")

    # Customize the plot
    plt.title("Gold-Based Index (GBI) for Big Seven Stocks", fontsize=16)
    plt.xlabel("Date", fontsize=14)
    plt.ylabel("Normalized GBI", fontsize=14)
    plt.legend(title="Stock Symbol", fontsize=12)
    plt.grid(True)
    plt.tight_layout()

    # Save the plot to a file
    plot_path = os.path.join(data_folder, "gbi_plot.png")
    plt.savefig(plot_path, dpi=300)
    print(f"Plot saved to {plot_path}")