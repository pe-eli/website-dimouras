import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useCart } from "../../CartContext";
import { db } from "../../firebase/config";
import "./combos.css";

type ComboDoc = {
	nome?: string;
	itens?: string[];
	preco?: number | string;
	imagem?: string;
	ativo?: boolean;
	ordem?: number;
};

type Combo = {
	id: string;
	nome: string;
	itens: string[];
	preco: number;
	imagem?: string;
	ativo?: boolean;
	ordem?: number;
};

const parsePriceToNumber = (value: number | string | undefined): number => {
	if (typeof value === "number") {
		return value;
	}
	if (!value) {
		return 0;
	}
	const cleaned = String(value)
		.trim()
		.replace(/[R$\s]/g, "")
		.replace(/\./g, "")
		.replace(/,/g, ".");
	const numberValue = Number(cleaned);
	return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatPrice = (value: number): string =>
	value.toFixed(2).replace(".", ",");

function Combos() {
	const { addToCart } = useCart();
	const [combos, setCombos] = useState<Combo[]>([]);
	const [carregando, setCarregando] = useState(true);
	const [erro, setErro] = useState("");

	useEffect(() => {
		const combosRef = collection(db, "combos");
		const unsubscribe = onSnapshot(
			combosRef,
			(snapshot) => {
				const list = snapshot.docs.map((doc) => {
					const data = doc.data() as ComboDoc;
					return {
						id: doc.id,
						nome: data.nome ?? "",
						itens: Array.isArray(data.itens) ? data.itens : [],
						preco: parsePriceToNumber(data.preco),
						imagem: data.imagem,
						ativo: data.ativo,
						ordem: data.ordem,
					};
				});

				setCombos(list);
				setCarregando(false);
				setErro("");
			},
			(error) => {
				console.error("Erro ao carregar combos:", error);
				setErro("Nao foi possivel carregar os combos.");
				setCarregando(false);
			}
		);

		return () => unsubscribe();
	}, []);

	const combosOrdenados = useMemo(() => {
		return [...combos]
			.filter((combo) => combo.nome)
			.filter((combo) => combo.ativo !== false)
			.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
	}, [combos]);

	const handleAddToCart = (combo: Combo) => {
		const itensTexto = combo.itens.length > 0 ? ` - ${combo.itens.join(", ")}` : "";
		addToCart({
			name: `Combo ${combo.nome}${itensTexto}`,
			price: `R$${formatPrice(combo.preco)}`,
			qty: 1,
			category_id: "food",
		});
	};

	if (!carregando && !erro && combosOrdenados.length === 0) {
		return null;
	}

	return (
		<section className="section-combo">
			<h2>Combos</h2>

			{carregando && <p className="combo-status">Carregando...</p>}
			{erro && <p className="combo-status combo-status--erro">{erro}</p>}

			<div className="grid-combo">
				{combosOrdenados.map((combo) => {
					const imageClass = combo.imagem ? `combo-image combo-${combo.id}` : "combo-image combo-image-fallback";
					return (
					<article className="product-card combo-card" key={combo.id}>
						<div className={imageClass}
							style={combo.imagem ? { backgroundImage: `url(${combo.imagem})` } : undefined}
						/>
						<div className="product-info">
							<h3>{combo.nome}</h3>
							<ul className="combo-items">
								{combo.itens.map((item, index) => (
									<li key={`${combo.id}-${index}`}>{item}</li>
								))}
							</ul>
							<div className="product-footer">
								<p className="product-price">R${formatPrice(combo.preco)}</p>
								<button className="btn-combo" onClick={() => handleAddToCart(combo)}>
									Adicionar ao carrinho
								</button>
							</div>
						</div>
					</article>
					);
				})}
			</div>

       <div
        style={{
          width: "70vw",
          height: "5px",
          backgroundColor: "red",
          placeSelf: "center",
          borderRadius: "40%"
        }}
      ></div>

		</section>
	);
}

export default Combos;