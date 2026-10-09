SET SESSION sql_mode = '';
CREATE INDEX idx_L_price
  ON rets_property (L_SystemPrice);

CREATE INDEX idx_L_beds
  ON rets_property (L_Keyword2);

CREATE INDEX idx_L_baths
  ON rets_property (LM_Dec_3);

CREATE INDEX idx_L_city_price
  ON rets_property (L_City, L_SystemPrice);

CREATE INDEX idx_L_city_zip
  ON rets_property (L_City, L_Zip);

CREATE INDEX idx_L_beds_baths
  ON rets_property (L_Keyword2, LM_Dec_3);