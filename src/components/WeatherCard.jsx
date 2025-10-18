import { useState, useEffect } from "react";

export default function WeatherCard({ defaultCity = "济南" }) {
  const [city, setCity] = useState(defaultCity);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  const API_KEY = process.env.REACT_APP_QWEATHER_KEY;

  useEffect(() => {
    if (!city) return;

    setError(null);
    setWeather(null);

    // 查询城市 ID
    fetch(
      `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(
        city
      )}&key=${API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("城市查询结果：", data);
        if (data.code === "200" && data.location?.length > 0) {
          const locationId = data.location[0].id;
          // 查询天气
          return fetch(
            `https://devapi.qweather.com/v7/weather/now?location=${locationId}&key=${API_KEY}`
          );
        } else {
          throw new Error("城市查询失败");
        }
      })
      .then((res) => res.json())
      .then((weatherData) => {
        console.log("天气数据：", weatherData);
        if (weatherData.code === "200") {
          setWeather(weatherData.now);
        } else {
          throw new Error("天气查询失败: " + weatherData.code);
        }
      })
      .catch((err) => {
        console.error("天气请求失败:", err);
        setError("请求出错，请稍后再试");
      });
  }, [city, API_KEY]);

  return (
    <div
      style={{
        padding: "8px",
        marginBottom: "10px",
        borderRadius: "12px",
        background: "rgba(255, 255, 255, 0.25)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ fontSize: "14px", marginBottom: "8px" }}>天气卡片</h3>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="输入城市名称"
        style={{
          width: "50%",
          padding: "4px 6px",
          fontSize: "12px",      // 加上这一行，文字小点
          borderRadius: "4px",
          border: "1px solid #ddd",
          marginBottom: "6px",
        }}
      />

      {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

      {weather ? (
        <div style={{ fontSize: "14px" }}>
          <p>温度：{weather.temp}℃</p>
          <p>天气：{weather.text}</p>
          <p>风向：{weather.windDir}</p>
        </div>
      ) : !error ? (
        <p style={{ fontSize: "13px", color: "#666" }}>暂无天气数据</p>
      ) : null}
    </div>
  );
}
