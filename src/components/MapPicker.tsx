import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { LatLng } from "leaflet";

// Tipagem das props
interface MapPickerProps {
  onLocalSelect: (data: { lat: number; lng: number; address: string }) => void;
}

// 🔹 Componente interno que detecta cliques no mapa
function LocationMarker({ onLocalSelect }: MapPickerProps) {
  const [position, setPosition] = useState<LatLng | null>(null);
  const map = useMap();

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const newPos = new L.LatLng(lat, lng);
      setPosition(newPos);
      map.flyTo(newPos, 15);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();

        onLocalSelect({
          lat,
          lng,
          address: data.display_name || "Endereço não encontrado",
        });
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
      }
    },
  });

  return position ? <Marker position={position}></Marker> : null;
}

// 🔹 Componente para centralizar o mapa na posição atual do usuário
function FlyToUserLocation({
  userPosition,
}: {
  userPosition: LatLng | null;
}) {
  const map = useMap();

  if (userPosition) {
    map.flyTo(userPosition, 15, { duration: 1.5 });
  }

  return null;
}

// 🔹 Componente principal do mapa
export default function MapPicker({
  onLocalSelect,
}: {
  onLocalSelect: (data: { lat: number; lng: number; address: string }) => void;
}) {
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada neste navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const current = new L.LatLng(latitude, longitude);
        setUserPosition(current);

        onLocalSelect({
          lat: latitude,
          lng: longitude,
          address: "Minha localização atual",
        });
      },
      () => alert("Não foi possível obter sua localização.")
    );
  };

  return (
    <div style={{ width: "100%", height: "330px", position: "relative", zIndex: "10" }}>
      <button
        onClick={handleUseMyLocation}
        style={{
          position: "absolute",
          zIndex: 500,
          top: 10,
          right: 10,
          padding: "8px 12px",
          borderRadius: "8px",
          border: "none",
          background: "#007bff",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Usar minha localização
      </button>

      <MapContainer
        center={[-20.536361, -45.586120]} 
        zoom={13}
        style={{ width: "100%", height: "100%", borderRadius: "10px", zIndex: "1" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contribuidores'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcador do clique no mapa */}
        <LocationMarker onLocalSelect={onLocalSelect} />

        {/* Move o mapa até o local do usuário */}
        <FlyToUserLocation userPosition={userPosition} />

        {/* Marcador da localização atual */}
        {userPosition && <Marker position={userPosition}></Marker>}
      </MapContainer>
    </div>
  );
}
