import { useState, useEffect, useRef } from "react"
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import Spinner from "../components/Spinner"


function CreateListing() {
  const [geoEnabled, setGeoEnabled] = useState(true)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 0,
    bathrooms: 0,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
    userRef: ''
  })

  const { type, name, bedrooms, bathrooms, parking, furnished, address, offer, regularPrice, discountedPrice, images, latitude, longitude } = formData

  const auth = getAuth()
  const navigate = useNavigate()
  const isMounted = useRef(true)

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({...formData, userRef: user.uid})
        } else {
          navigate('/sign-in')
        }
      })
    }

    return () => {
      isMounted.current = false
    }
  }, [isMounted])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const onMutate = (e: any) => {
    let boolean : boolean | null = null

    if (e.target.value === 'true') {
      boolean = true
    }

    if (e.target.value === 'false') {
      boolean = false
    }

    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files
      }))
    }

    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value
      }))
    }
  }


  if (loading) {
    return <Spinner />
  }

  return (
    <div className='profile'>
      <header>
        <p className="pageHeader">Create a Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className="formButtons">
            <button type='button' 
            className={type === 'sale' ? 'formButtonActive' : 
              'formButton'}
            id='type'
            value='sale'
            onClick={onMutate}
            >
              Sell
            </button>
            <button type='button' 
            className={type === 'rent' ? 'formButtonActive' : 
              'formButton'}
            id='type'
            value='rent'
            onClick={onMutate}
            >
              Rent
            </button>
          </div>

          <label className="formLabel">Name</label>
          <input 
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength={32}
            minLength={10}
            required
          />

          <div className="formRooms flex">
            <div>
              <label className="formLabel">
                Bedrooms
              </label>
              <input 
                type="number" 
                className="formInputSmall"
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min={1}
                max={50}
                required
              />
            </div>
            <div>
              <label className="formLabel">
                Bathrooms
              </label>
              <input 
                type="number" 
                className="formInputSmall"
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min={1}
                max={50}
                required
              />
            </div>
            <div >
              <label className="formLabel">
                Parking
              </label>
              <button
                className={
                  parking ? 'formButtonActive' : 'formButton'
                }
                type='button'
                value={String(true)}
                id='parking'
                onClick={onMutate}
              >
                Yes
              </button>
              <button
                className={
                  !parking && parking !== null ? 'formButtonActive' : 'formButton'
                }
                type='button'
                value={String(false)}
                id='parking'
                onClick={onMutate}
              >
                No
              </button>
            </div>
            
            <div>
              <label className="formLabel">
                Furnished
              </label>
              <button
                className={
                  furnished ? 'formButtonActive' : 'formButton'
                }
                value={String(true)}
                type='button'
                id='furnished'
                onClick={onMutate}
              >
                Yes
              </button>
              <button
                className={
                  !furnished && furnished !== null ? 'formButtonActive' : 'formButton'
                }
                value={String(false)}
                type='button'
                id='furnished'
                onClick={onMutate}
              >
                No
              </button>
            </div>
            <div>
              <label className="formLabel">
                Offer
              </label>
              <button
                className={
                  offer ? 'formButtonActive' : 'formButton'
                }
                value={String(true)}
                type='button'
                id='offer'
                onClick={onMutate}
              >
                Yes
              </button>
              <button
                className={
                  !offer && offer !== null ? 'formButtonActive' : 'formButton'
                }
                value={String(false)}
                type='button'
                id='offer'
                onClick={onMutate}
              >
                No
              </button>
            </div>
          </div>

          <label className="formLabel">Address</label>
          <textarea 
            className="formInputAddress"
            id='address'
            value={address}
            onChange={onMutate}
            required
          />

          {!geoEnabled &&
            <div>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          }

          <div className="formPriceDiv">
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min={50}
              max={750000000}
              required
            />
            {type === 'rent' && (
              <p className="formPriceText">Dollars / Month</p>
            )}
          </div>

          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input 
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className="imagesInfo">The first image (out of 6 at maximum) will be the cover image.</p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />
          <button 
            type='submit' 
            className="primaryButton createListingButton">
            Create Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateListing