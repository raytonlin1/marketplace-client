import { Link } from 'react-router-dom'
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg'
import bedIcon from '../assets/svg/bedIcon.svg'
import bathtubIcon from '../assets/svg/bathtubIcon.svg'

type Listing = {
  type?: string,
  imgUrls?: string[],
  name?: string,
  location?: string,
  regularPrice?: number,
  offer?: boolean,
  discountedPrice?: number,
  bedrooms?: number,
  bathrooms?: number,
  id?: number
}

const ListingItem = (props: {listing: Listing, id: string, onDelete?: any}) => {
  const { listing, id, onDelete } = props
  return (
    <li className='categoryListing'>
      <Link to={`/category/${listing.type}/${id}`}
      className='categoryListingLink'>
        <img src={listing.imgUrls![0]} alt={listing.name}
        className='categoryListingImg'/>
        <div className="categoryListingDetails">
          <div className="categoryListingLocation">
            {listing.location}
          </div>
          <p className="categoryListingName">
            {listing.name}
          </p>
          <p className="categoryListingPrice">
            ${listing.offer ? listing.discountedPrice : listing.regularPrice}
            {listing.type === 'rent' && ' / Month'}
          </p>
          <div className="categoryListingInfoDiv">
            <img src={bedIcon} alt="bed" />
            <p className="categoryListingInfoText">
              {listing.bedrooms! > 1 ? `${listing.bedrooms} Bedrooms` : '1 Bedroom'}
            </p>
            <img src={bathtubIcon} alt="bath" />
            <p className="categoryListingInfoText">
              {listing.bathrooms! > 1 ? `${listing.bathrooms} Bedrooms` : '1 Bathroom'}
            </p>
          </div>
        </div>
      </Link>

      { onDelete && (
        <DeleteIcon className='removeIcon' fill='rgb(231,76,60)' 
        onClick={() => {
          onDelete(listing.id, listing.name)
        }}/>
      )}
    </li>
  )
}

export default ListingItem