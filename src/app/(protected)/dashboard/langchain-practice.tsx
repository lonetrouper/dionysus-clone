import React from 'react'
import { api } from '~/trpc/react'

const LangchainPractice = () => {
    const langchain = api.langchain.getLangchainResponse.useQuery()
  return (
    <div>LangchainPractice</div>
  )
}

export default LangchainPractice