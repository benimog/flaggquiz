import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { createFilterOptions } from "@mui/material";
import Typography from "@mui/material/Typography";
import { Country } from "../types/Country";
import FeedbackSnackbar from "./feedback/FeedbackSnackbar";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import ScoreDisplay from "./ScoreDisplay";

function FlagWrite() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [randomCountry, setRandomCountry] = useState<Country | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | string>("");
  const [correctPicks, setCorrectPicks] = useState<number>(0);
  const [incorrectPicks, setIncorrectPicks] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" as "error" | "info" });
  const autocompleteRef = useRef<HTMLDivElement | null>(null);

  const filterOptions = createFilterOptions({
    matchFrom: "start",
    stringify: (option: Country) => option.translations.swe.common,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(
        "https://restcountries.com/v3.1/independent?status=true&fields=name,flags,translations"
      );
      const sorted = response.data.sort(
        (
          a: { translations: { swe: { common: string } } },
          b: { translations: { swe: { common: string } } }
        ) =>
          a.translations.swe.common.localeCompare(
            b.translations.swe.common,
            "sv",
            { sensitivity: "case" }
          )
      );
      setCountries(sorted);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (countries.length > 0) {
      getRandomCountry();
    }
  }, [countries]);

  const getRandomCountry = () => {
    if (countries.length > 0) {
      const randomIndex = Math.floor(Math.random() * countries.length);
      setRandomCountry(countries[randomIndex]);
    }
  };

  const handleChoice = () => {
    if (!selectedCountry || typeof selectedCountry === "string") {
      setSnackbar({ open: true, message: "Välj ett land först!", severity: "info" });
      return;
    }
    if (selectedCountry === randomCountry) {
      setCorrectPicks((prev) => prev + 1);
    } else {
      setIncorrectPicks((prev) => prev + 1);
      setSnackbar({
        open: true,
        message: `Fel! Rätt svar är ${randomCountry?.translations.swe.common}`,
        severity: "error",
      });
    }

    setSelectedCountry("");
    getRandomCountry();
    if (autocompleteRef.current) {
      const input = autocompleteRef.current.querySelector("input");
      input?.focus();
    }
  };

  const resetPicks = () => {
    setCorrectPicks(0);
    setIncorrectPicks(0);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage onRetry={fetchData} />;

  return (
    <div>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Välj rätt land för flaggan
      </Typography>
      {randomCountry && (
        <div>
          <img
            src={randomCountry.flags.png}
            alt={randomCountry.flags.alt}
            style={{
              maxWidth: "320px",
              width: "100%",
              height: "auto",
              borderRadius: "4px",
            }}
          />
          <Autocomplete
            sx={{ mt: 2, mb: 2 }}
            ref={autocompleteRef}
            id="country-combo-box"
            options={countries}
            filterOptions={filterOptions}
            getOptionLabel={(option) => option.translations.swe.common}
            renderOption={(props, option) => (
              <li {...props}>{option.translations.swe.common}</li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Land"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && selectedCountry) {
                    handleChoice();
                  }
                }}
              />
            )}
            ListboxProps={{ style: { maxHeight: 200 } }}
            onChange={(_event, value) =>
              value ? setSelectedCountry(value) : setSelectedCountry("")
            }
          />
          <div>
            <Button variant="contained" onClick={() => handleChoice()}>
              Svara
            </Button>
            <ScoreDisplay
              correct={correctPicks}
              incorrect={incorrectPicks}
              onReset={resetPicks}
            />
          </div>
        </div>
      )}

      <FeedbackSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ open: false, message: "", severity: "error" })}
      />
    </div>
  );
}

export default FlagWrite;
