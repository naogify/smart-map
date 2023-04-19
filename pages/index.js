import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [query, setQuery] = useState();
  const [mapObject, setMapObject] = useState();
  const [simpleStyle, setSimpleStyle] = useState();
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new window.geolonia.Map({
      container: mapContainer.current,
      zoom: 4,
      center: [136.83, 37.88],
      hash: false,
      style: "geolonia/gsi",
    })

    setMapObject(map);
  });

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: inputText }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setQuery(data.query);

      if (mapObject && data.geojson) {

        if (mapObject.getSource('overpass') && simpleStyle) {

          simpleStyle.updateData(data.geojson).fitBounds()

        } else {
          const simpleStyle = new geolonia.simpleStyle(data.geojson, {
            id: 'overpass',
          })
          simpleStyle.addTo(mapObject).fitBounds()

          setSimpleStyle(simpleStyle)
        }
      }

      setInputText("");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div className="container">
      <Head>
        <title>AI ジオコーダー</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.inputSection}>
          <h3>探したい場所を入力して下さい</h3>
          <form onSubmit={onSubmit}>
            <input
              type="text"
              name="animal"
              placeholder="京田辺市のレストランを探して下さい"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <input type="submit" value="質問する" />
          </form>
          <textarea className={styles.textarea} value={query} disabled/>
          <div className={styles.subTitle}>このアプリでは、入力した文章から <a href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_1.html" target="_blank" rel="noopener noreferrer">国土数値情報の行政区域データ</a>からバウンディングボックスを生成し、入力文とバウンディングボックスを OpenAIのAPI に渡し<a href="https://wiki.openstreetmap.org/wiki/JA:Overpass_API" target="_blank" rel="noopener noreferrer">Overpass_API</a>のクエリを生成します</div>
          <a href="https://github.com/earth-genome/ChatGeoPT" target="_blank" rel="noopener noreferrer">本プロジェクトは、ChatGeoPT をベースに作成しています。</a>
          <a href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_1.html" target="_blank" rel="noopener noreferrer">「国土数値情報（行政区域データ）」（国土交通省）を加工して作成</a>
        </div>
        <div className={styles.map} ref={mapContainer} />
      </main>
      <script type="text/javascript" src="https://cdn.geolonia.com/v1/embed?geolonia-api-key=YOUR-API-KEY"></script>
    </div>
  );
}