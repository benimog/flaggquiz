import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

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

const Countries: React.FC = () => {
  const [data, setData] = useState<Country[] | null>(null);
  const [copyList, setCopyList] = useState<Country[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Country[]>(
          "https://restcountries.com/v3.1/all?fields=name,flags,translations"
        );

        const sorted = response.data.sort((a, b) =>
          a.translations.swe.common.localeCompare(
            b.translations.swe.common,
            "sv",
            { sensitivity: "case" }
          )
        );

        setData(sorted);
        setCopyList(sorted);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const contentEl = document.querySelector(".content");
    contentEl?.classList.add("content--scroll");

    return () => {
      contentEl?.classList.remove("content--scroll");
    };
  }, []);

  const requestSearch = (searched: string) => {
    if (!data) {
      return;
    }

    const value = searched.trim().toLowerCase();

    if (!value.length) {
      setCopyList(data);
      return;
    }

    setCopyList(
      data.filter((item) =>
        item.translations.swe.common.toLowerCase().includes(value)
      )
    );
  };

  const darkTheme = useMemo(() => createTheme({ palette: { mode: "dark" } }), []);
  const isDesktop = useMediaQuery("(min-width:1024px)");

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        component="section"
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #03060f 0%, #101c2c 100%)",
          py: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 4 },
        }}
      >
        <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Länder & territorier
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Utforska världens länder och deras flaggor. Använd sökfältet för att
              snabbt hitta ett land.
            </Typography>
          </Box>

          <TextField
            variant="outlined"
            placeholder="Sök..."
            type="search"
            onChange={(e) => requestSearch(e.target.value)}
            InputProps={{ sx: { borderRadius: 999 } }}
            sx={{
              width: "100%",
              maxWidth: "480px",
              display: "block",
              mx: "auto",
              mb: 3,
            }}
          />

          <TableContainer
            component={Paper}
            elevation={isDesktop ? 6 : 2}
            sx={{
              borderRadius: 3,
              backgroundColor: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(12px)",
              overflow: "hidden",
            }}
          >
            <Table size={isDesktop ? "medium" : "small"}>
              <TableHead>
                <TableRow>
                  <TableCell align={isDesktop ? "left" : "center"}>
                    <Typography component="span" variant="subtitle1" fontWeight={600}>
                      Land / region
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography component="span" variant="subtitle1" fontWeight={600}>
                      Flagga
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {copyList ? (
                  copyList.map((item) => (
                    <TableRow
                      key={item.translations.swe.common}
                      hover
                      sx={{
                        display: "table-row",
                        transition: "background-color 0.2s ease",
                        "&:nth-of-type(odd)": {
                          backgroundColor: "rgba(255,255,255,0.02)",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.08)",
                        },
                      }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        align={isDesktop ? "left" : "right"}
                        sx={{
                          fontSize: { xs: "0.95rem", md: "1.05rem" },
                          fontWeight: 500,
                          letterSpacing: "0.015em",
                          width: { xs: "45%", md: "35%" },
                          whiteSpace: "normal",
                        }}
                      >
                        {item.translations.swe.common}
                      </TableCell>
                      <TableCell align="center" sx={{ width: { xs: "55%", md: "65%" } }}>
                        <Box
                          component="img"
                          src={item.flags.png}
                          alt={item.translations.swe.common}
                          loading="lazy"
                          sx={{
                            width: { xs: 96, sm: 120, md: 160 },
                            maxWidth: "100%",
                            height: "auto",
                            borderRadius: 1,
                            boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      Hämtar data...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Countries;
