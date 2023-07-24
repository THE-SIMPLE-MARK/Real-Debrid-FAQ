import { useEffect, useState } from "react"

export default function useFAQ() {
	const [query, setQuery] = useState("")
	const [answers, setAnswers] = useState([])
	const [results, setResults] = useState([])

	useEffect(() => {
		getAnswers(setAnswers)
	}, [])

	useEffect(() => {
		filterAnswers(answers, query, setResults)
	}, [query])

	return {
		query,
		setQuery,
		results,
	}
}

async function getAnswers(setAnswers) {
	// get the amount of keywords
	const keywordsResponse = await fetch(
		"https://api.real-debrid.com/rest/1.0/support/getKeywords/en",
		{ method: "GET" }
	)
	console.log("keyword request")

	if (!keywordsResponse.ok)
		return alert(
			"Real Debrid failed to response with the expected data. The service may be down or you may have been rate limited."
		)

	const keywordsData = await keywordsResponse.json()
	const keywordsCount = Object.keys(keywordsData).length

	// fetch the answers to each keyword
	for (let i = 1; i < keywordsCount; i++) {
		const answerResponse = await fetch(
			`https://api.real-debrid.com/rest/1.0/support/getAnswer/en/${i}`
		)
		console.log("answer request")

		if (!answerResponse.ok)
			return alert(
				"Real Debrid failed to response with the expected data. The service may be down or you may have been rate limited."
			)

		const answerData = await answerResponse.json()

		await setAnswers(answers => [
			...answers,
			{
				title: answerData.title,
				description: answerData.answer,
			},
		])
	}
}

async function filterAnswers(answers, query, setResults) {
	const filteredAnswers = answers.filter(answer => {
		const sanitizedQuery = removeSpecialCharacters(query)
		const sanitizedTitle = removeSpecialCharacters(answer.title)
		const sanitizedDescription = removeSpecialCharacters(answer.description)

		return (
			sanitizedTitle.includes(sanitizedQuery) ||
			sanitizedDescription.includes(sanitizedQuery)
		)
	})

	await setResults(Array.from(new Set(filteredAnswers)))
}

function removeSpecialCharacters(string) {
	if (typeof string !== "string") return ""
	return string
		.toLowerCase()
		.normalize("NFD") // normalize accented characters
		.replace(/[\u0300-\u036f]/g, "") // remove accents
		.replace(/\s/g, "") // remove spaces
}