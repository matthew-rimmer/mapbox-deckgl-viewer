import { useState } from "react";
import "./model-settings.css";

export function ModelSettingsComponent() {
	const [amount, setAmount] = useState(1);
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
						onChange={({ target }) => setAmount(Number.parseInt(target.value))}
					/>
				</div>
			</div>
		</div>
	);
}
