import { For, createSignal, onMount } from 'solid-js'
import sqliteWorker from './sqlite-worker?worker'
import './App.css'
import { User, useUser } from './context/UserContext'
import { createStore, produce } from 'solid-js/store'

function App() {
  let dbWorker: Worker
  const [uid, setUid] = createSignal(0)
  const [name, setName] = createSignal('')
  const [gender, setGender] = createSignal('')
  const [email, setemail] = createSignal('')
  const [city, setCity] = createSignal('')

  const [seletedUser, setSelectedUser] = createStore<User>({
    uid: 0,
    name: '',
    gender: '',
    email: '',
    city: ''
  })

  const { userData, setUserData } = useUser()

  onMount(async () => {
    dbWorker = new sqliteWorker()
    dbWorker.postMessage({
      type: "create"
    })

    dbWorker.addEventListener('message', (e) => {
      switch (e.data.type) {
        case "list":
          setUserData(e.data.data)
          break
      }
    })
  });

  const addUser = async () => {
    try {
      const newUser: User = {
        uid: uid(),
        name: name(),
        gender: gender(),
        email: email(),
        city: city()
      }
      dbWorker.postMessage({
        type: "add",
        ...newUser
      })
      setUserData(produce((userData) => {
        userData.push(newUser)
      }))
    } catch (err) {
    }
  }

  const deleteUser = () => {
    dbWorker.postMessage({
      type: "delete",
      uid: seletedUser.uid
    })
  }

  const updateUser = () => {
    setUserData(
      user => user.uid === seletedUser.uid,
      seletedUser
    )
    dbWorker.postMessage({
      type: "update",
      uid: seletedUser.uid,
      name: seletedUser.name,
      gender: seletedUser.gender,
      email: seletedUser.email,
      city: seletedUser.city
    })
  }

  let addUserModalRef: HTMLDialogElement | undefined
  let editUserModalRef: HTMLDialogElement | undefined

  return (
    <>
      <dialog id="my_modal_3" class="modal" ref={addUserModalRef}>
        <div class="modal-box">
          <h3 class="font-bold text-lg py-8">Enter User Details</h3>
          <input placeholder="UID" class="input input-bordered w-full max-w-xs my-3" type='number' onInput={(e) => setUid(parseInt(e.currentTarget.value))}></input>
          <input placeholder="Name" class="input input-bordered w-full max-w-xs my-3" onInput={(e) => setName(e.currentTarget.value ?? '')}></input>
          <input placeholder="Gender" class="input input-bordered w-full max-w-xs my-3" onInput={(e) => setGender(e.currentTarget.value ?? '')}></input>
          <input placeholder="Email" class="input input-bordered w-full max-w-xs my-3" onInput={(e) => setemail(e.currentTarget.value ?? '')}></input>
          <input placeholder="City" class="input input-bordered w-full max-w-xs my-3" onInput={(e) => setCity(e.currentTarget.value ?? '')}></input>
          <br></br>
          <div class="modal-action">
            <form method="dialog">
              <button class='btn btn-outline' onClick={addUser}>Add User</button>
              <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
          </div>
        </div>
      </dialog>
      <dialog id="my_modal_3" class="modal" ref={editUserModalRef}>
        <div class="modal-box">
          <h3 class="font-bold text-lg py-8">Edit User Details</h3>
          <input placeholder={`${seletedUser.uid}`} value={seletedUser.uid} class="input input-bordered w-full max-w-xs my-3" type='number' disabled></input>
          <input value={seletedUser.name} class="input input-bordered w-full max-w-xs my-3" onInput={(e) => setSelectedUser({ ...seletedUser, name: e.currentTarget.value })}></input>
          <input value={seletedUser.gender} class="input input-bordered w-full max-w-xs my-3" onInput={(e) => setSelectedUser({ ...seletedUser, gender: e.currentTarget.value })}></input>
          <input value={seletedUser.email} class="input input-bordered w-full max-w-xs my-3" onInput={(e) => setSelectedUser({ ...seletedUser, email: e.currentTarget.value })}></input>
          <input value={seletedUser.city} class="input input-bordered w-full max-w-xs my-3" onInput={(e) => setSelectedUser({ ...seletedUser, city: e.currentTarget.value })}></input>
          <br></br>
          <div class="modal-action">
            <form method="dialog">
              <button class='btn btn-outline btn-error mx-3' onClick={deleteUser}>Delete User</button>
              <button class='btn btn-neutral' onClick={updateUser}>Save</button>
              <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
          </div>
        </div>
      </dialog>
      <h1 class="font-bold text-lg m-5">Solid + Sqlite Demo</h1>
      <div class="card">
        <button class="btn btn-primary" onClick={() => addUserModalRef?.showModal()}>
          Add user
        </button>
        <br></br>
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>UID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Email</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              <For each={userData}>
                {(user) => (
                  <>
                    <tr class='hover' onClick={() => {
                      setSelectedUser(user)
                      editUserModalRef?.showModal()
                    }}>
                      <td>{user.uid}</td>
                      <td>{user.name}</td>
                      <td>{user.gender}</td>
                      <td>{user.email}</td>
                      <td>{user.city}</td>
                    </tr>
                  </>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default App
