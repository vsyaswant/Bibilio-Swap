import fs from "fs";
import { parse } from "csv-parse";

export type Row = {
  title: string;
  authors: string;
  genre: string;
  thumbnail: string;
};

export function readCsv(filePath: string): Promise<readonly Row[]> {
  return new Promise((resolve, reject) => {
    const rows: Row[] = [];

    fs.createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
        })
      )
      .on("data", (row: any) => {
        rows.push({
          title: row.title,
          authors: row.authors,
          genre: row.genre,
          thumbnail: row.thumbnail,
        });
      })
      .on("end", () => {
        resolve(rows);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
