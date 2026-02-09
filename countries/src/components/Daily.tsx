import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { createFilterOptions } from "@mui/material";
import Typography from "@mui/material/Typography";
import seedrandom from "seedrandom";
import { Country } from "../types/Country";
import FeedbackSnackbar from "./feedback/FeedbackSnackbar";
import GameOverDialog from "./feedback/GameOverDialog";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

function Daily() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [randomCountry, setRandomCountry] = useState<Country | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | string>("");
  const [correctPicks, setCorrectPicks] = useState<number>(0);
  const [incorrectPicks, setIncorrectPicks] = useState<number>(0);
  const [dailyCountries, setDailyCountries] = useState<Country[]>([]);
  const [countryIndex, setCountryIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [gameOver, setGameOver] = useState({ open: false, message: "" });
  const autocompleteRef = useRef<HTMLDivElement | null>(null);
  const numberOfCountries = 10;

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
      setCountryIndex(0);
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
      getDailyCountries();
    }
  }, [countries]);

  useEffect(() => {
    if (dailyCountries.length > 0) {
      getRandomCountry();
    }
  }, [dailyCountries]);

  const getRandomCountry = () => {
    if (dailyCountries.length > 0) {
      setRandomCountry(dailyCountries[countryIndex]);
    }
  };

  const handleChoice = () => {
    const isCorrect =
      typeof selectedCountry !== "string" &&
      selectedCountry.name.common === randomCountry?.name.common;

    if (isCorrect) {
      setCorrectPicks((prev) => prev + 1);
    } else {
      setIncorrectPicks((prev) => prev + 1);
      setSnackbar({
        open: true,
        message: `Fel! Rätt svar är ${randomCountry?.translations.swe.common}`,
      });
    }

    setSelectedCountry("");

    if (countryIndex === numberOfCountries - 1) {
      const finalCorrect = correctPicks + (isCorrect ? 1 : 0);
      const finalIncorrect = incorrectPicks + (isCorrect ? 0 : 1);
      setGameOver({
        open: true,
        message: `Du fick ${finalCorrect} rätt och ${finalIncorrect} fel.`,
      });
      setCountryIndex(0);
      setCorrectPicks(0);
      setIncorrectPicks(0);
      getDailyCountries();
    } else {
      setCountryIndex((prevIndex) => prevIndex + 1);
    }
  };

  useEffect(() => {
    getRandomCountry();
  }, [countryIndex]);

  useEffect(() => {
    if (autocompleteRef.current) {
      const input = autocompleteRef.current.querySelector("input");
      input?.focus();
    }
  }, [randomCountry]);

  const getDailyCountries = () => {
    const date = new Date(
      new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" })
    );

    const seed = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    const rng = seedrandom(seed);

    const getRandomObjects = (
      _seed: string,
      array: Country[],
      count: number
    ) => {
      const shuffledArray = [...array];

      for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [
          shuffledArray[j],
          shuffledArray[i],
        ];
      }

      return shuffledArray.slice(0, count);
    };
    const selectedCountries = getRandomObjects(
      seed,
      countries,
      numberOfCountries
    );

    setDailyCountries(selectedCountries);
  };

  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    let dayString = date
      .toLocaleDateString("sv-SE", options)
      .charAt(0)
      .toUpperCase();
    dayString += date.toLocaleDateString("sv-SE", options).slice(1);
    return dayString;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage onRetry={fetchData} />;

  return (
    <div>
      <Typography variant="h5" component="h2">
        {getCurrentDate()}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        Välj rätt land för flaggan
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Flagga {countryIndex + 1} av {numberOfCountries}
      </Typography>
      <div>
        <img
          src={randomCountry?.flags.png}
          alt={randomCountry?.flags.alt}
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
          <Typography variant="body1" sx={{ mt: 1 }}>
            Rätta svar: {correctPicks}
          </Typography>
          <Typography variant="body1">Felaktiga svar: {incorrectPicks}</Typography>
        </div>
      </div>

      <FeedbackSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity="error"
        onClose={() => setSnackbar({ open: false, message: "" })}
      />

      <GameOverDialog
        open={gameOver.open}
        title="Väl spelat!"
        message={gameOver.message}
        onClose={() => setGameOver({ open: false, message: "" })}
        onPlayAgain={() => {
          setGameOver({ open: false, message: "" });
        }}
      />
    </div>
  );
}

export default Daily;
