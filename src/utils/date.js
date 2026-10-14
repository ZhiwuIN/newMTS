import { parse, isValid, format } from 'date-fns'

export function formatDateToDMY(value) {
	if (value === null || value === undefined) return ''
	const text = String(value).trim()
	if (!text) return ''

	const datePart = text.split(/[ T]/, 1)[0]
	let inputFormat
	if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(datePart)) {
		inputFormat = 'yyyy-M-d'
	} else if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(datePart)) {
		inputFormat = 'yyyy/M/d'
	} else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(datePart)) {
		inputFormat = 'd/M/yyyy'
	} else {
		return text
	}

	const date = parse(datePart, inputFormat, new Date(2000, 0, 1))
	return isValid(date) ? format(date, 'dd/MM/yyyy') : text
}
