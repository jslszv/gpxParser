/**
 * @module gpxPraser
 * @description Este módulo extrae los datos de logitud, latitud,Time, elevacion y ritmo cardiaco de un archivo GPX
 * @version 1.0.0
 * @fileoverview Archivo unico del módulo.
 *
 * @author José Luis Zúñiga Valencia
 * @license MIT
 * @date 2024-12-11
 *
 * @requires xml2js@0.6.2
 *
 * @example
 * const gpxParser = require("./gpxParser");
 * const path = "C:/..../track.gpx";
 * gpxParser.getTrackPointsData(path).then((tpData) => {
 *   console.log("Información de los puntos:");
 *  console.log(tpData);
 *  }).catch((error) => {
 *      console.error("Error:", error);
 * });
 */
"use strict";
const fs = require("fs");
const xml2js = require("xml2js");

/**
 * Función que parsea un archivo GPX y devuelve las coordenadas de los track points junto con el ritmo cardíaco, el timestamp en zona horaria local y la elevación.
 * @param {string} path Ruta al archivo GPX.
 * @returns {Promise<Array>} Una promesa que se resuelve con un arreglo de objetos que contienen las coordenadas, ritmo cardíaco, timestamp en zona horaria local y elevación.
 */
function getTrackPointsData(path) {
  return new Promise((resolve, reject) => {
    // Leer el archivo GPX
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }

      // Parsear el XML a un objeto JavaScript
      const parser = new xml2js.Parser();
      parser.parseString(data, (err, result) => {
        if (err) {
          return reject(err);
        }

        // Extraer las coordenadas, ritmo cardíaco, timestamp y elevación de los track points
        try {
          const trackPoints = result.gpx.trk[0].trkseg[0].trkpt;
          const datos = trackPoints.map((point) => {
            const lat = parseFloat(point.$.lat);
            const lon = parseFloat(point.$.lon);

            // Extraer la elevación, si está disponible
            let elevation = null;
            if (point.ele && point.ele[0]) {
              elevation = parseFloat(point.ele[0]);
            }

            // Extraer el timestamp, si está disponible
            let timestamp = null;
            if (point.time && point.time[0]) {
              timestamp = new Date(point.time[0]);
              // Convertir el timestamp a la zona horaria local
              timestamp = timestamp.toLocaleString(); // Esto convierte a la zona horaria local
            }

            // Verificar si hay información de ritmo cardíaco en las extensiones

            let heartRate = null;
            if (
              point.extensions &&
              point.extensions[0]["gpxtpx:TrackPointExtension"][0][
                "gpxtpx:hr"
              ][0]
            ) {
              heartRate = parseInt(
                point.extensions[0]["gpxtpx:TrackPointExtension"][0][
                  "gpxtpx:hr"
                ][0]
              );
            }

            return { lat, lon, heartRate, timestamp, elevation };
          });

          resolve(datos);
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}
function showProps(obj, objName) {
  let result = "";
  Object.keys(obj).forEach((i) => {
    result += `${objName}.${i} = ${obj[i]}\n`;
  });
  return result;
}
/**
 * Función que parsea un archivo GPX y devuelve la información contenida en 'metadata', específicamente los campos 'name', 'desc' y 'author'.
 * @param {string} path Ruta al archivo GPX.
 * @returns {Promise<Object>} Una promesa que se resuelve con un objeto que contiene la información de 'name', 'desc' y 'author' de 'metadata'.
 */
function GetMetadata(path) {
  return new Promise((resolve, reject) => {
    // Leer el archivo GPX
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }

      // Parsear el XML a un objeto JavaScript
      const parser = new xml2js.Parser();
      parser.parseString(data, (err, result) => {
        if (err) {
          return reject(err);
        }

        // Extraer la información de metadata
        try {
          const metadata = result.gpx.metadata ? result.gpx.metadata[0] : {};
          const name = metadata.name ? metadata.name[0] : null;
          const desc = metadata.desc ? metadata.desc[0] : null;
          const author = metadata.author ? metadata.author[0] : null;

          // Devolver la información en un objeto
          resolve({
            name,
            desc,
            author,
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}
module.exports = {
  getTrackPointsData,
  GetMetadata,
};
