import { useState, useEffect, useRef } from "react"
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import Spinner from "../components/Spinner"
import { toast } from "react-toastify"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { v4 as uuidv4 } from 'uuid'

interface formData {
  type: string,
  name: string,
  bedrooms: number,
  bathrooms: number,
  parking: boolean,
  furnished: boolean,
  address?: string,
  offer: boolean,
  regularPrice: number,
  discountedPrice?: number,
  images?: any,
  latitude: number,
  longitude: number,
  location?: string
  userRef: string
}

function CreateListing() {
  const [geoEnabled, setGeoEnabled] = useState(true)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<formData>({
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
    images: [],
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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    if (offer && discountedPrice! >= regularPrice) {
      toast.error('Discounted Price must be less than Regular Price')
      setLoading(false)
      return
    }

    if (images!.length > 6) {
      setLoading(false)
      toast.error('Only up to 6 images can be saved')
      return
    }

    let geolocation = {
      lat: 0,
      lng: 0
    }
    let location 

    if (geoEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      )
      const data = await response.json()

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0
      location = data.status === 'ZERO_RESULTS' ? undefined : data.results[0]?.formatted_address
      
      if (location === undefined || location.includes('undefined')) {
        setLoading(false)
        toast.error('Please enter a correct address')
        return
      }
    } else {
      geolocation.lat = latitude
      geolocation.lng = longitude
    }

    const storeImage = async (image: any) => {
      return new Promise((resolve, reject) => {
        
        const storage = getStorage()
        const fileName = `${auth.currentUser!.uid}-${image.name}-${uuidv4()}`
        
        const storageRef = ref(storage, 'images/' + fileName)
        const uploadTask = uploadBytesResumable(storageRef, image);
        
        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        }, 
        (error) => {
          reject(error)
        }, 
        () => {
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL)
          });
        }
        );
      })
    }

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
      ).catch(() => {
        setLoading(false)
        toast.error('Images unable to be uploaded')
        return
      }
    )
    
    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp()
    }

    delete formDataCopy.images
    delete formDataCopy.address
    formDataCopy.location = address
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy)

    setLoading(false)
    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
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
            minLength={1}
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
                min={0}
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
                min={0}
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
            <div>
              <label className="formLabel">Address</label>
              <textarea 
                className="formInputAddress"
                id='address'
                value={address}
                onChange={onMutate}
                required
              />
            </div>
          </div>

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

          <div>
          <label className='formLabel'>
              Price (in Dollars
              {type === 'rent' ? (
                ' / Month)'
              ) : (
                ')'
              )}
            </label>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min={0}
              max={750000000}
              required
            />
            
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
                min='0'
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