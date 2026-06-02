import { useState, useEffect } from 'react';

const useTasaCambio = () => {
    const [tasa, setTasa] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/tasas/activa')
            .then(r => r.ok ? r.json() : null)
            .then(d => setTasa(d?.tasa ? Number(d.tasa) : null))
            .catch(() => setTasa(null));
    }, []);

    return tasa;
};

export default useTasaCambio;
