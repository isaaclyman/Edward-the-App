import swal from 'sweetalert'

export const ValidateTitle = (itemName, title) => {
  const minlength = 1
  const maxlength = 60

  if (title.length < minlength || title.length > maxlength) {
    swal({
      icon: 'error',
      text: `Sorry, ${itemName} titles must be between ${minlength} and ${maxlength} letters.`
    })
    return false
  }

  return true
}
