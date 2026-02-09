export interface Country {
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
