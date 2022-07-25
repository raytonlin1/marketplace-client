import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { Link, useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { db } from "../firebase.config";
import shareIcon from '../assets/svg/shareIcon.svg'

function Listing() {
  const [listing,setListing] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [shareLinkCopied, setShareLinkCopied] = useState<boolean>(false)

  const navigate = useNavigate()
  const params = useParams()
  const auth = getAuth()

  useEffect(() => {
    const fetchListing = async (): Promise<void> => {
      const docRef = doc(db, 'listings', params.listingId!)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        console.log(docSnap.data())
        setListing(docSnap.data())
        setLoading(false)
      }
    }

    fetchListing()
  }, [navigate, params.listingId])

  if (loading) {
    return <Spinner />
  }

  const displayImage = (imgUrls: string[]) => {
    return (
      <div>
        {imgUrls.map((url: string, index: number) => {
          return (<img src={imgUrls[index]} alt='Image'
          className='categoryListingImg'/>)
        })}
      </div>
    )
  }

  return (
    <main>
      {
        <div>
          {displayImage(listing!.imgUrls!)}
        </div>
      }
      
      <div className="shareIconDiv" onClick={() => {
        navigator.clipboard.writeText(window.location.href)
        setShareLinkCopied(true)
        setTimeout(() => {
          setShareLinkCopied(false)
        }, 2000)
      }}>
        <img src={shareIcon} alt="" />
      </div>

      {shareLinkCopied && 
        <p className="linkCopied">
          Link copied to clipboard.
        </p>
      }

      <div className="listingDetails">
        <p className="listingName">
          {listing.name} - ${listing.offer ? listing.discountedPrice : listing.regularPrice}
        </p>
        <p className="listingLocation">
          {listing.location}
        </p>
        <p className="listingType">
          {listing.type === 'rent' ? 'Rent' : 'Sale'}
        </p>
        {listing.offer && (
          <p className="discountPrice">
            ${listing.regularPrice - listing.discountedPrice} discount
          </p>
        )}

        <ul className="listingDetailsList">
          <li>
            { listing.bedrooms !== 1 ? `${listing.bedrooms} Bedrooms` : '1 Bedroom'}
          </li>
          <li>
            { listing.bathrooms !== 1 ? `${listing.bathrooms} Bathrooms` : '1 Bathroom'}
          </li>
          <li> { listing.parking && 'Parking Spot' } </li>
          <li> { listing.furnished && 'Furnished Place' } </li>
        </ul>

        <p className="listingLocationTitle">
          Location
        </p>
          
        <div className="leafletContainer"> 
          <MapContainer style={{height: '100%', width: '100%'}}
          center={[listing.geolocation.lat, listing.geolocation.lng]}
          zoom={13}
          scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
            />

            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
            >
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        { auth.currentUser?.uid !== listing.userRef && (
          <Link to={`/contact/${listing.userRef}?listingName=${listing.name}`} className='primaryButton'>
            Contact item owner
          </Link>
        )}
      </div>
    </main>
  );
}

export default Listing;