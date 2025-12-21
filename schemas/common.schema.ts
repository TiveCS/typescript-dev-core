import z from "zod";

export const zodIsoDateSchema = z.codec(z.iso.date(), z.date(), {
	decode: (isoString) => new Date(isoString),
	encode: (date) => date.toISOString(),
});

export const zodIsoDatetimeSchema = z.codec(z.iso.datetime(), z.date(), {
	decode: (isoString) => new Date(isoString),
	encode: (date) => date.toISOString(),
});
