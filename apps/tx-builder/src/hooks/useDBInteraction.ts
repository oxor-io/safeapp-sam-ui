import { useState } from 'react'
import axios from 'axios'

const apiUrl = ''

const useDBInteraction = () => {
  const [data, setData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const getData = () => {

  }

  const postData = () => {

  }

  return {  }
}

export default useDBInteraction
