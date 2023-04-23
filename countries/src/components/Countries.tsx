import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const Countries: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://restcountries.com/v3.1/all?fields=name,flags,translations"
        );

        setData(
          response.data.sort(
            (
              a: { translations: { swe: { common: string } } },
              b: { translations: { swe: { common: string } } }
            ) =>
              a.translations.swe.common.localeCompare(
                b.translations.swe.common,
                "sv",
                { sensitivity: "case" }
              )
          )
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  interface Country {
    flags: {
      alt: string;
      png: string;
      svg: string;
    };
    name: {
      common: string;
      official: string;
    };
    translations: {
      swe: {
        official: string;
        common: string;
      };
    };
  }

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" variant="head">
                Land/ region
              </TableCell>
              <TableCell align="center" variant="head">
                Flagga
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data ? (
              data.map((item: Country) => (
                <TableRow key={item.translations.swe.common}>
                  <TableCell component="th" scope="row">
                    {item.translations.swe.common}
                  </TableCell>
                  <TableCell>
                    <img
                      src={item.flags.png}
                      alt={item.translations.swe.common}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell>Hämtar data...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </ThemeProvider>
  );
};

export default Countries;
