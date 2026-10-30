import { useEffect, useState } from "react";
import api, { errorText } from "../api/client";

// GET a path and return { data, error }. Change `reload` to refetch.
export default function useFetch(path, params = {}, reload = 0) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const key = JSON.stringify(params);

  useEffect(() => {
    if (!path) return;
    let live = true;
    api
      .get(path, { params: JSON.parse(key) })
      .then((r) => {
        if (live) {
          setData(r.data);
          setError(null);
        }
      })
      .catch((e) => live && setError(errorText(e)));
    return () => {
      live = false;
    };
  }, [path, key, reload]);

  return { data, error };
}