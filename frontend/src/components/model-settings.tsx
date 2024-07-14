import { useState } from "react";
import "./model-settings.css";

interface ModelSettingsProps {
	onAmountChange: (amount: number) => void;
}

export function ModelSettingsComponent({ onAmountChange }: ModelSettingsProps) {
	const [amount, setAmount] = useState(1);

	const onAmountChanged = (amount: number) => {
		const parsedAmount = Number.isNaN(amount) ? 0 : amount;
		setAmount(parsedAmount);
		onAmountChange(parsedAmount);
	};

	return (
		<div className="model-settings">
			<h2>Model settings</h2>
			<div>
				<div className="model-setting-item">
					Amount
					<input
						className="amount-input"
						type="number"
						value={amount ?? 0}
						onChange={({ target }) => onAmountChanged(Number.parseInt(target.value))}
					/>
				</div>
			</div>
		</div>
	);
}
