import { useState } from 'react'

export function useCardForm() {
  const [details, setDetails] = useState({
    number: '',
    firstName: '',
    lastName: '',
    expiry: '',
    cvv: ''
  })

  const updateField = (field, value) => {
    setDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => {
    setDetails({
      number: '',
      firstName: '',
      lastName: '',
      expiry: '',
      cvv: ''
    })
  }

  return {
    details,
    updateField,
    resetForm
  }
}
