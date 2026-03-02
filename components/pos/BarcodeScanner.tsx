"use client";
import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
}

export default function BarcodeScanner({ onScanSuccess }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Configuramos el escáner: 
        // fps: cuadros por segundo. qrbox: el tamaño del cuadro para apuntar
        scannerRef.current = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                rememberLastUsedCamera: true, // Recuerda si usaste la frontal o trasera
            },
            false
        );

        scannerRef.current.render(
            (decodedText) => {
                // Cuando lee un código con éxito, lo envía a tu pantalla de ventas
                onScanSuccess(decodedText);

                // Opcional: Pausar el escáner 2 segundos para no leer el mismo código 50 veces por accidente
                scannerRef.current?.pause(true);
                setTimeout(() => scannerRef.current?.resume(), 2000);
            },
            (errorMessage) => {
                // Aquí ignora los errores porque la cámara falla muchas veces por segundo intentando enfocar
            }
        );

        // Limpieza cuando cierras el componente para que la cámara se apague
        return () => {
            scannerRef.current?.clear().catch((error) => console.error("Error al limpiar escáner", error));
        };
    }, [onScanSuccess]);

    return (
        <div className="w-full max-w-md mx-auto overflow-hidden rounded-lg shadow-lg">
            <div id="reader" className="w-full"></div>
            <p className="text-center text-sm text-gray-500 mt-2">
                Apunta la cámara al código de barras del producto
            </p>
        </div>
    );
}