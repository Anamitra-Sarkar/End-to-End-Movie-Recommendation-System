import pandas as pd
try:
    df = pd.read_csv('./Artifacts/movies.csv', nrows=5)
    print("Genres Example:")
    print(df['genres'].tolist())
    print("Year Example (release_date):")
    print(df['release_date'].tolist())
except Exception as e:
    print(e)
