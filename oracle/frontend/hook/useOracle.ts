import {useState} from "react";
import {City} from "@/type/City";
import {Oracle} from "@/type/Oracle";
import {useSuiClient} from "@mysten/dapp-kit";

export default function useOracle() {
  const [oracleLoading, setOracleLoading] = useState(false);
  const client = useSuiClient();

  const searchCity = async (query: string) => {
    setOracleLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/search?q=${query}`
      );
      const data = await response.json();
      setOracleLoading(false);
      const cities = data as unknown as City[];
      return cities;
    } catch (error) {
      setOracleLoading(false);
      throw error;
    }
  };

  const createOracle = async (
    city_name: string,
    latitude: number,
    longitude: number,
    target_time: number,
    target_temp: number
  ) => {
    setOracleLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/oracle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city_name,
          latitude,
          longitude,
          target_time,
          target_temp,
        }),
      });
      const data = await response.json();
      setOracleLoading(false);
      return data;
    } catch (error) {
      setOracleLoading(false);
      throw error;
    }
  };

  const getOracles = async () => {
    setOracleLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/oracles`);
      const data = await response.json();
      setOracleLoading(false);
      const oracles = data as unknown as Oracle[];
      return oracles;
    } catch (error) {
      setOracleLoading(false);
      throw error;
    }
  };

  return {
    oracleLoading,
    searchCity,
    createOracle,
    getOracles,
  };
}
