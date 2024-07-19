import { ReplaySubject } from "rxjs";
import "./warning-console.css";
import { useEffect, useState } from "react";

interface WarningConsoleProps {
	$deckglWarningLog: ReplaySubject<string>;
}

export function WarningConsoleComponent({ $deckglWarningLog }: WarningConsoleProps) {
	const [messages, setMessages] = useState<string[]>([]);

	useEffect(() => {
		const sub = $deckglWarningLog.subscribe((warning) => {
			setMessages((latestMessages) =>
				latestMessages.includes(warning) ? latestMessages : [...latestMessages, warning],
			);
		});

		() => {
			sub.unsubscribe();
		};
	}, []);

	if (messages.length === 0) {
		return <></>;
	}

	return (
		<div className="warning-console">
			<h3>Warning and Errors</h3>
			<ul>
				{messages.map((message) => (
					<ul key={message}>{message}</ul>
				))}
			</ul>
		</div>
	);
}
