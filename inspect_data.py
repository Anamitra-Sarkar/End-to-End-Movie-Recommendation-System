import pandas as pd
try:
    df = pd.read_csv('./Artifacts/main_data.csv')
    print("Columns:", df.columns.tolist())
    print("First 2 rows:", df.head(2).to_dict())
    print("Dtypes:", df.dtypes)
except Exception as e:
    print(e)
