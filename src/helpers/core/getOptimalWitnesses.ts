import { EXTENDED_WITNESSES } from "@/constants";

export function getOptimalWitnesses(bitLength: number): bigint[] {
  if (bitLength <= 64) return EXTENDED_WITNESSES.slice(0, 2);
  if (bitLength <= 256) return EXTENDED_WITNESSES.slice(0, 4);
  if (bitLength <= 512) return EXTENDED_WITNESSES.slice(0, 7);
  if (bitLength <= 1024) return EXTENDED_WITNESSES.slice(0, 10);
  if (bitLength <= 2048) return EXTENDED_WITNESSES.slice(0, 13);

  return EXTENDED_WITNESSES;
}
