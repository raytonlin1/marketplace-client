import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import {db} from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

type Listing = {
  id: string,
  data: {
    type?: string,
    imgUrls?: string[],
    name?: string
  }
}

function Category() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [lastFetchedListing, setLastFetchedListing] = useState<any>(null)

  const params = useParams()

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, 'listings')

        const q = query(
          listingsRef, 
          where('type', '==', params.categoryName), 
          orderBy('timestamp','desc'),
          limit(10)
        )

        const querySnap = await getDocs(q)

        const lastVisible = querySnap.docs[querySnap.docs.length - 1]
        setLastFetchedListing(lastVisible)

        const listings : Listing[] = []

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data()
          })
        })

        setListings(listings)
        setLoading(false)


      } catch (error) {
        toast.error('Could not fetch listings')
      }
    }

    fetchListings()
  }, [params.categoryName])

  const onFetchMoreListings = async () => {
    try {
      const listingsRef = collection(db, 'listings')

      const q = query(
        listingsRef, 
        where('type', '==', params.categoryName), 
        orderBy('timestamp','desc'),
        startAfter(lastFetchedListing),
        limit(10)
      )

      const querySnap = await getDocs(q)

      const lastVisible = querySnap.docs[querySnap.docs.length - 1]
      setLastFetchedListing(lastVisible)

      const listings : Listing[] = []

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data()
        })
      })

      setListings((prevState) => [...prevState, ...listings])
      setLoading(false)


    } catch (error) {
      toast.error('Could not fetch more listings')
    }
  }

  return (
    <div className='category'>
      <header>
        <p className="pageHeader">
          { params.categoryName === 'rent' ? 'Items for rent' : 'Items for sale' }
        </p>
      </header>

      {loading ? <Spinner /> :
        listings.length > 0 ? (
          <>
            <main>
              <ul className="categoryListings">
                { listings.map((listing) => (
                  <ListingItem listing={listing.data} id={listing.id} />
                )) }
              </ul>
            </main>

            <br />
            <br />
            {
              lastFetchedListing && (
                <p className="loadMore" onClick={onFetchMoreListings}>Load More</p>
              )
            }
          </>
        ) 
        : 
        (<p>No listings for {params.categoryName}</p>)
      }
    </div>
  )
}

export default Category