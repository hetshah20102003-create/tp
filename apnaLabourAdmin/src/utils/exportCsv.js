export function exportToCsv(filename, rows) {
	if (!rows || rows.length === 0) {
		return;
	}
	const headers = Object.keys(rows[0]);
	const csvContent = [headers.join(',')]
		.concat(
			rows.map(row => headers.map(h => escapeCsv(String(row[h] ?? ''))).join(','))
		)
		.join('\n');
	const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.setAttribute('download', filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function escapeCsv(value) {
	const needsQuotes = /[",\n]/.test(value);
	let escaped = value.replace(/"/g, '""');
	return needsQuotes ? `"${escaped}"` : escaped;
}
