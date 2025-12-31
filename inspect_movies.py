import pandas as pd
try:
    df = pd.read_csv('./Artifacts/movies.csv')
    print("Columns:")
    for col in df.columns:
        print(col)
except Exception as e:
    print(e)
