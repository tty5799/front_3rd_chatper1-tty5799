import {Store} from "../../utils/store.js";
import {Logger} from "../../utils/logger.js";

export const addUserInfoFormEvent = () => {
    const store = new Store()
    const logger = new Logger()
    const {username, email, bio, name} = store.getState()
    const form = document.getElementById('profile-form')
    document.getElementById('username').value = username || name
    document.getElementById('email').value = email
    document.getElementById('bio').value = bio

    form.addEventListener('submit',(event) => {
        event.preventDefault()
        const formData = new FormData(form);
        const username = formData.get('username')
        const email = formData.get('email')
        const bio = formData.get('bio')

        localStorage.setItem('user' , JSON.stringify({name:username,email,bio,username}))
        store.setState({username,email,bio})
        alert('프로필이 업데이트되었습니다.')
        logger.log({
            type : 'event',
            location : 'addUserInfoFromEvent',
            message : 'success user profile event'
        })
    })
}
