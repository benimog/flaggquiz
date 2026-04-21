import React, { useEffect, useState } from "react";
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
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTranslation } from "react-i18next";
import { Country } from "../types/Country";
import { getAllCountries } from "../data/countries";
import { getCountryName } from "../i18n/countryNames";

const Countries: React.FC = () => {
  const { t, i18n } = useTranslation();
  const data = getAllCountries();
  const [copyList, setCopyList] = useState<Country[]>(data);

  useEffect(() => {
    const contentEl = document.querySelector(".content");
    contentEl?.classList.add("content--scroll");

    return () => {
      contentEl?.classList.remove("content--scroll");
    };
  }, []);

  const requestSearch = (searched: string) => {
    const value = searched.trim().toLowerCase();

    if (!value.length) {
      setCopyList(data);
      return;
    }

    setCopyList(
      data.filter((item) =>
        getCountryName(item, i18n.language).toLowerCase().includes(value)
      )
    );
  };

  const isDesktop = useMediaQuery("(min-width:1024px)");

  return (
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
            {t("pages.countries.title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("pages.countries.description")}
          </Typography>
        </Box>

        <TextField
          variant="outlined"
          placeholder={t("pages.countries.searchPlaceholder")}
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
                    {t("pages.countries.headerCountry")}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography component="span" variant="subtitle1" fontWeight={600}>
                    {t("pages.countries.headerFlag")}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {copyList.map((item) => {
                const displayName = getCountryName(item, i18n.language);
                return (
                  <TableRow
                    key={item.name.common}
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
                      {displayName}
                    </TableCell>
                    <TableCell align="center" sx={{ width: { xs: "55%", md: "65%" } }}>
                      <Box
                        component="img"
                        src={item.flags.png}
                        alt={displayName}
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Countries;
