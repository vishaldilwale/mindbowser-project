import React, {useEffect, useState} from "react";
import Axios from "axios";

let MindBowser =()=>{
    // Initial fetch result state and pagination info state
    let[fetchAllResults,setFetchAllResults]=useState(null);
    let[fetchAllInfo,setFetchAllInfo]=useState(null);

    // Search / search result / pagination info / error state
    let [search,setSearch]=useState({
        name:"" ,
        gender:"",
        status:"",
        species:"",
        type:""
    });
    let[searchedResults,setSearchedResults]=useState(null);
    let[searchedInfo,setSearchInfo]=useState(null);
    let[searchError,setSearchError]=useState(null);

    // Favourites state
    let[favourites,setFavourites]=useState([]);

    // Show favourites state
    let[favouritesLogo,setFavouritesLogo]=useState([]);

    // Email input state
    let[email,setEmail]=useState(null);

    // User data state
    let[userData,setUserData]=useState({
        email:"",
        favourites:[],
        _id:""
    });

    // Message state
    let [emailAddedMessage,setEmailAddedMessage]=useState(null);
    let [userError,setUserError]=useState(null);

    // handles form show state
    let [show,setShow]=useState("addEmail");

    // server error state
    let [serverError,setServerError]=useState(null);

    // Loader main / Loader favourites state
    let [loading,setLoading]=useState(false);
    let [favouritesLoading,setFavouritesLoading]=useState(false);

    useEffect(()=>{
        fetchAll();
        fetchFavouritesDataFromApi();
        return(()=>setFavouritesLogo([]));
    },[favourites]);

    // fetch data from Rick&MontyAPI
    let fetchAll=()=>{
        if(!fetchAllInfo?.prev || !fetchAllInfo?.next){
            let dataURL = `https://rickandmortyapi.com/api/character`;
            Axios.get(dataURL).then((response) => {
                setFetchAllResults(response.data.results);
                setFetchAllInfo(response.data.info);
                console.log(response.data);
            }).catch((err) => {
                console.error(err);
            });}
    };

    // fetch Previous page
    let fetchPrevPage=()=>{
        if(fetchAllInfo.prev){
            setLoading(true);
            let dataURL = fetchAllInfo.prev;
            Axios.get(dataURL).then((response) => {
                setFetchAllResults(response.data.results);
                setFetchAllInfo(response.data.info);
                // setSearchCharacters([]);
                setSearchedResults(null);
                console.log(response.data);
                setLoading(false);
            }).catch((err) => {
                console.error(err);
                setLoading(false);
            });
        }
        else return null

    };

    // fetch Next page
    let fetchNextPage=()=>{
        if(fetchAllInfo.next){
            setLoading(true);
            let dataURL = fetchAllInfo.next;
            Axios.get(dataURL).then((response) => {
                setFetchAllResults(response.data.results);
                setFetchAllInfo(response.data.info);
                setSearchedResults(null);
                console.log(response.data);
                setLoading(false);
            }).catch((err) => {
                console.error(err);
            });
        }
        else return null
    };

    // Handle favourites
    let handleFavorites=(e)=>{
        let id = e.target.id;

        // Remove from favourites
        if(favourites?.includes(id)){
            let newArray=favourites?.filter(item=> item !==id);
            setFavourites(newArray);
            setUserData({...userData,
                favourites: favourites,
            });
        }
        else{
            //add to favourites
            setFavourites([...favourites,id]);
        }
    };

    // Handle search
    let handleSearch=(e)=>{
        e.preventDefault();
        setLoading(true);
        let name= search.name ? `name=${search.name}` : "";
        let type= search.type ? `&type=${search.type}` : "";
        let species= search.species ? `&species=${search.species}` : "";
        let gender= search.gender ? `&gender=${search.gender}` : "";
        let status= search.status ? `&status=${search.status}` : "";
        // let dataURL = `https://rickandmortyapi.com/api/character/?name=${name}&status=${status}&species=${species}&type=${type}&gender=${gender}`;
        let dataURL = `https://rickandmortyapi.com/api/character/?${name}${status}${species}${type}${gender}`;
        Axios.get(dataURL).then((response) => {
            setSearchInfo(response.data.info);
            setSearchedResults(response.data.results);
            console.log(response.data);
            setLoading(false);
        }).catch((err) => {
            console.error(err);
            setSearchError(`No records found for ${name} ${status} ${species} ${type} ${gender}`);
            setTimeout(()=>{
                setSearchError(null)
            },3000);
            setLoading(false);
        });
    };

    // Add email to DB
    let saveEmail = (e) => {
        e.preventDefault();
        setLoading(true);
        // let dataURL = `http://127.0.0.1:5000/`;
        let dataURL = `/`;

        // Save new email
        if(userData?.email?.length === 0 ){
            let user={
                email:email,
                favourites:favourites
            };
            Axios.post(dataURL, user).then((response) => {
                //email added message
                setEmailAddedMessage(true);
                setTimeout(()=>{
                    setEmailAddedMessage(false)
                },3000);

                // Get user with _id from response
                let {email,favourites,_id}=response.data.user;
                console.log(response);
                setUserData({
                    email:email,
                    favourites: favourites,
                    _id:_id
                });
                setLoading(false);
            }).catch((err) => {
                setServerError(err);
                console.log(err)
            });
        }
        else{
            // Update user favourites
            setLoading(true);
            let {email,_id}=userData;
            let updatedUserData={
                email:email,
                favourites:favourites,
                _id:_id
            };

            // Send updated user to DB
            Axios.post(dataURL, updatedUserData).then((response) => {
                let responseUser=JSON.stringify(response.data.user);
                console.log(`updatedServerUser is ${responseUser}`);
                setLoading(false);
            }).catch((err) => {
                setServerError(err);
                console.log(err)
            });
        }
    };

    // Fetch email data from DB
    let fetchEmail=(e)=>{
        e.preventDefault();
        setLoading(true);

        // Send email value in params
        let dataURL = `/${email}`;
        Axios.get(dataURL).then((response) => {
            let {email,favourites,_id}=response.data;

            // Update user state with new response data
            setUserData({
                email:email,
                favourites: favourites,
                _id:_id
            });
            console.log(response);
            setFavourites(favourites);
            setLoading(false);
            // fetchFavouritesDataFromApi();
        }).catch((err) => {
            setServerError({
                errorMessage : err
            });

            // User not found message
            setUserError("User not found");
            setTimeout(()=>{
                setUserError(null)
            },3000);
            setLoading(false);
        });
    };

    // Fetch favourites from api
    let fetchFavouritesDataFromApi=()=> {
        console.log(favourites.toString());
        setFavouritesLoading(true);
            let dataURL = `https://rickandmortyapi.com/api/character/${favourites.toString()}`;
            Axios.get(dataURL).then((response) => {
                setFavouritesLogo(response.data);
                console.log(response.data);
                setFavouritesLoading(false);
            }).catch((err) => {
                console.error(err);
            });

    };
    return(
        <React.Fragment>

            {/*--------------- Show Loader -------------*/}
            {loading &&
            <div className="h-100 min-vh-100 container-fluid position-absolute sticky-top position-fixed d-flex justify-content-center"
                 style={{zIndex:"2",background: "rgba( 255, 255, 255, 0.15 )",
                     boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
                     backdropFilter: "blur( 4.0px )",
                     borderRadius: "10px"}}>
                <div className="spinner-border text-center m-auto text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>}

            {/*--------------- Main Section -------------*/}
            <div className="container my-5">
                <div className="row border p-2 align-items-center  justify-content-center">
                    <div className="col-md-5">
                        {/*--------------- Search character form -------------*/}
                        <form onSubmit={handleSearch}>
                            {/*--------------- Search Name -------------*/}
                            <small className="ml-4 my-1" >Name</small>
                            <input type="text" name="name"
                                   onChange={(e)=>setSearch({...search,name:e.target.value})} id="exampleForm2"
                                   placeholder="Search your favourite character"
                                   className="form-control rounded-pill font-small text-center text-muted"/>
                            <div className="d-flex justify-content-between ">

                                {/*--------------- Gender filter -------------*/}
                                <div>
                                    <small className="ml-4 mt-2" >Gender</small>
                                    <select onChange={(e)=>setSearch({...search,gender:e.target.value})} className="browser-default py-1 rounded-pill font-small text-center custom-select mb-2">
                                        <option value="" selected disabled>Choose gender</option>

                                        {/*--------------- Set options -------------*/}
                                        {fetchAllResults?.map(card => card.gender)
                                            .filter((value, index, self) => self.indexOf(value) === index)
                                            .map((gender)=>{
                                                return(
                                                    <option name="gender"
                                                            key={gender}
                                                            value={gender} >{gender}</option>
                                                )
                                            })}
                                    </select>
                                </div>
                                {/*--------------- Status filter -------------*/}
                                <div>
                                    <small className="ml-4 mt-2" >Status</small>
                                    <select onChange={(e)=>setSearch({...search,status:e.target.value})}
                                            className="browser-default rounded-pill font-small text-center custom-select mb-2">
                                        <option value="" selected disabled>Choose status</option>

                                        {/*--------------- Set options -------------*/}
                                        {fetchAllResults?.map(card => card.status)
                                            .filter((value, index, self) => self.indexOf(value) === index)
                                            .map((status)=>{
                                                return(
                                                    <option name="status" key={status}   value={status} >{status}</option>
                                                )
                                            })}
                                        {/*<option value="Alive" selected>Alive</option>*/}
                                        {/*<option value="Dead">Dead</option>*/}
                                    </select>
                                </div>
                            </div>
                            {/*--------------- Species filter -------------*/}
                            <div>
                                <small className="ml-4 mt-2" >Species</small>
                                <select onChange={(e)=>setSearch({...search,species:e.target.value})}
                                        className="browser-default rounded-pill font-small text-center custom-select mb-2">
                                    <option value="" selected disabled>Choose species</option>
                                    {/*--------------- Set options -------------*/}
                                    {fetchAllResults?.map(card => card.species)
                                        .filter((value, index, self) => self.indexOf(value) === index)
                                        .map((species)=>{
                                            return(
                                                <option name="species" key={species}  value={species} >{species}</option>
                                            )
                                        })}
                                </select>
                            </div>
                            {/*--------------- Type filter -------------*/}
                            <div >
                                <small className="ml-4 mt-2" >Type</small>
                                <select  onChange={(e)=>setSearch({...search,type:e.target.value})}
                                         className="browser-default rounded-pill font-small text-center custom-select mb-4">
                                    <option value="" selected disabled>Choose type</option>
                                    {/*--------------- Set options -------------*/}
                                    {fetchAllResults?.map(card => card.type)
                                        .filter((value, index, self) => self.indexOf(value) === index)
                                        .map((type)=>{
                                            return(
                                                <option name="type" key={type} value={type ? type : ""} >{type? type : "Other"}</option>
                                            )
                                        })}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-sm shadow-none border rounded-pill w-50 text-center mx-auto d-flex justify-content-center">Search</button>
                        </form>
                    </div>

                    {/*--------------- Show page details -------------*/}
                    <div className="col-md-3 d-flex flex-column my-2 justify-content-center">
                        <div className="md-form mb-1 pb-1">
                            <div className="mb-0 font-small my-2 text-center h6 font-weight-normal">Total Characters
                                <p className="mb-0 h2 font-normal font-weight-bold">{fetchAllInfo?.count}</p></div>
                            <div className="mb-0 font-small my-2 text-center h6 font-weight-normal">Total Pages
                                <p className="mb-0 h2 font-normal font-weight-bold">{fetchAllInfo?.pages}</p></div>
                            <div className="mb-0 font-small my-2 text-center h6 font-weight-normal">Current Page
                                <p className="mb-0 h2 font-normal font-weight-bold">

                                    {/*--------------- Show current page -------------*/}
                                    {fetchAllInfo?.next?.substr((fetchAllInfo?.next?.length-2)-(fetchAllInfo?.next?.length)).includes("=") ?
                                        fetchAllInfo?.next?.substr((fetchAllInfo?.next?.length-1)-(fetchAllInfo?.next?.length))-1: //get last single digit
                                        fetchAllInfo?.next?.substr((fetchAllInfo?.next?.length-2)-(fetchAllInfo?.next?.length))-1 //get last 2 digit
                                    }</p></div>
                        </div>

                        {/*--------------- Next / Prev buttons -------------*/}
                        <div className="p-2 text-center  text-white">
                            <button onClick={fetchPrevPage} id={"2"} className="btn btn-sm rounded-pill btn-outline-success">Prev Page</button>
                            <button onClick={fetchNextPage} id={"1"} className="btn btn-sm rounded-pill btn-outline-success">Next Page</button>
                        </div>
                    </div>

                    {/*--------------- User email -------------*/}
                    <div className="col-md-4 border  p-2" style={{borderRadius:"20px"}}>
                        <div>
                            <div className="d-flex justify-content-around ">
                                {/*--------------- Show / hide "Add email"  and "Fetch data" -------------*/}
                                <button onClick={()=>setShow("addEmail")}
                                        className={show==="addEmail"?"btn mx-2 text-capitalize btn-success btn-sm rounded-pill":"btn mx-2 text-capitalize btn-outline-success btn-sm rounded-pill"}>Add Email</button>
                                <button onClick={()=>setShow("fetchEmail")}
                                        className={show==="fetchEmail"?"btn mx-2 text-capitalize btn-primary btn-sm rounded-pill":"btn mx-2 text-capitalize btn-outline-primary btn-sm rounded-pill"}>Fetch Favourites </button>
                            </div>
                        </div>
                        <div>
                            {/*--------------- Show "Add email" -------------*/}
                            {show=== "addEmail" ?
                            <form className=" p-2" onSubmit={saveEmail}>
                                <small className="text-center mx-auto my-2">
                                    <p className="text-center mx-auto my-2" >
                                        {userData.email ? <p className="font-weight-bold " >
                                            <i className="fa fa-user-circle mx-2 text-success"/>{userData.email}</p>:"Add Email to save your favourite characters."}
                                    </p>
                                    </small>
                                <input type="text"  required name="email"
                                       onChange={(e)=>setEmail(e.target.value)} id="exampleForm2"
                                       placeholder="Add email and save characters"
                                       className="form-control my-2 text-center font-small rounded-pill py-2"/>
                                <button type="submit" className="btn text-center mx-auto d-flex justify-content-center btn-sm text-capitalize  rounded-pill rounded-pill btn-success">Save</button>
                                {/*-------- Email added message -------*/}
                                {emailAddedMessage &&
                                <p className="text-center text-muted font-weight-bolder m-2"><i className="fa fa-check-circle mx-2 text-success"/>Email Saved</p>
                                 }
                            </form> : <form className=" p-2 " onSubmit={fetchEmail}>
                                    <small className="text-center mx-auto my-2 d-flex justify-content-center" >
                                        {userData.email ? <p className="font-weight-bold " >
                                            <i className="fa fa-user-circle mx-2 text-success"/>{userData.email}</p>:"Fetch your favourites characters."}
                                        </small>
                                    <input type="text" required name="email"
                                           onChange={(e)=>setEmail(e.target.value)} id="exampleForm2"
                                           placeholder="Fetch your favourite character"
                                           className="form-control my-2 text-center font-small rounded-pill py-2"/>
                                    <button type="submit" className="btn btn-sm text-center mx-auto text-capitalize d-flex justify-content-center rounded-pill rounded-pill btn-primary">Fetch</button>
                                    {/*--------------- User not found message -------------*/}
                                    {userError &&
                                    <p className="text-center animated jello text-danger m-2">{userError}</p>
                                   }
                                </form>}
                        </div>

                        {/*--------- Show favourites ----------*/}
                        <div className="position-relative d-flex">
                            {favouritesLogo?.length > 0 ?
                            <div className="d-flex flex-wrap">
                                {favouritesLogo?.map((item)=>{
                                    return(
                                        <div key={item.name + item.name} style={{position:"relative"}}>
                                            {/*--------------- Map favourites array -------------*/}
                                            <img src={item.image} style={{height:"50px"}} className="img-thumbnail m-1 rounded-circle"/>
                                            <div style={{position:"absolute",top:"0",right:"0"}}>
                                                <i onClick={handleFavorites} id={item.id}
                                                   className={favourites.includes(item?.id?.toString())? "fa fa-star text-warning" :"fa fa-star "}/>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>  :<div >
                                    {favouritesLogo?.image &&
                                        <div style={{position:"relative"}}>
                                            {/*--------------- Show single favourite object -------------*/}
                                    <img src={favouritesLogo.image} style={{height:"50px"}}
                                         className={favouritesLogo.image? "img-thumbnail m-1 rounded-circle":"d-none"}/>
                                         <div style={{position:"absolute",top:"0",right:"0"}}>
                                            <i onClick={handleFavorites} id={favouritesLogo.id}
                                               className={favourites.includes(favouritesLogo?.id?.toString())? "fa fa-star text-warning" :"fa fa-star "}/>
                                         </div>
                                        </div>}
                                </div>}

                            {/*--------------- Favourites fetch loader -------------*/}
                            {favouritesLoading &&
                            <div className=" m-auto  d-flex  justify-content-center bg-transparent" >
                                <div className="spinner-border text-center m-auto text-primary" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                            }
                        </div>


                    </div>

                </div>
            </div>

            {/*--------------- Show search error -------------*/}
            {searchError &&
            <div className="m-auto  w-50">
                <div className="p-4 m-4 border m-auto border-danger ">
                    <h4 className="text-danger text-center">{searchError}</h4>
                </div>
            </div>}
            <div>

            </div>


            {/*--------------- Show search results -------------*/}
            {searchedResults?.length>0 &&
            <div className="border m-4">
                <h4 className="text-center my-4">Search Results</h4>
                <div className="d-flex flex-wrap my-4">
                    {searchedResults?.map((card)=>{
                        return(
                            <div className="col-md-3 h-100" key={card.name} style={{height:"fit-content"}}>
                                <div className="card h-100 m-2">
                                    <div className="card-header d-flex justify-content-around align-items-center">
                                        <div>
                                            <img alt="" className="rounded-circle" height={50} width={50} src={card.image}/>
                                        </div>
                                        <div>
                                            <p className="h6 text-center ">{card.name}</p>
                                            <div className="d-flex flex-wrap justify-content-center text-centertext-muted">
                                                <div className="badge badge-pill mx-2 bg-transparent border shadow-none badge-light font-weight-normal">{card.species}</div>
                                                {/*<div className="badge badge-pill bg-transparent border shadow-none badge-info font-weight-normal">{card.status}</div>*/}

                                                <div className={card.status=== "Alive"? "badge mx-2 badge-pill bg-transparent border shadow-none badge-info font-weight-normal":
                                                    card.status=== "Dead"? "badge mx-2 badge-pill bg-transparent border shadow-none badge-danger font-weight-normal":"badge mx-2 badge-pill bg-transparent border shadow-none badge-light font-weight-normal"
                                                }>
                                                    {card.status}</div>
                                                <div className="badge badge-pill mx-2 bg-transparent border shadow-none badge-info font-weight-normal">
                                                    {card.episode.length}</div>
                                                <div>
                                                    <i onClick={handleFavorites} id={card.id}
                                                       className={favourites.includes(card.id.toString())? "fa fa-star text-warning" :"fa fa-star "}/>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body  px-4">
                                        <p className="mb-0 d-flex justify-content-between"><span className="font-small text-muted">Gender: </span><span >{card.gender}</span></p>
                                        <p className="mb-0 d-flex justify-content-between "><span className="font-small  text-muted">Species: </span>{card.species}</p>
                                        {card?.type && <p className="mb-0  d-flex justify-content-between"><span className="font-small  text-muted">Type: </span>{card?.type}</p>
                                        }
                                        <p className="mb-0 d-flex justify-content-between"><span className="font-small text-muted">Status</span>{card.status}</p>
                                        <p className="mb-0 d-flex justify-content-between"><span className="font-small text-muted">Location: </span> {card.location.name}</p>
                                        <p className="mb-0 d-flex justify-content-between"><span className="font-small text-muted">Origin: </span> {card.origin.name}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            }

            {/*--------------- Show initial fetch results -------------*/}
            <div className="d-flex flex-wrap my-4">
                {fetchAllResults?.length > 0 && fetchAllResults?.map((card)=>{
                    return(
                        <div className="col-md-3 h-100" key={card.id} style={{height:"fit-content"}}>
                            <div className="card h-100 m-2">
                                <div className="card-header d-flex justify-content-around align-items-center">
                                    <div>
                                        <img alt="" className="rounded-circle" height={50} width={50} src={card.image}/>
                                    </div>
                                    <div>
                                        <p className="h6 text-center ">{card.name}</p>
                                        <div className="d-flex flex-wrap justify-content-center text-centertext-muted">
                                            <div className="badge badge-pill mx-2 bg-transparent border shadow-none badge-light font-weight-normal">{card.species}</div>
                                            <div className={card.status=== "Alive"? "badge mx-2 badge-pill bg-transparent border shadow-none badge-info font-weight-normal":
                                                card.status=== "Dead"? "badge mx-2 badge-pill bg-transparent border shadow-none badge-danger font-weight-normal":"badge mx-2 badge-pill bg-transparent border shadow-none badge-light font-weight-normal"
                                            }>
                                                {card.status}</div>

                                            {/*--------------- Episodes -------------*/}
                                            <div className="badge badge-pill mx-2 bg-transparent border shadow-none badge-info font-weight-normal">{card.episode.length}</div>

                                            {/*--------------- Favourites star icon -------------*/}
                                            <div>
                                                    <i onClick={handleFavorites} id={card.id}
                                                       className={favourites.includes(card.id.toString())? "fa fa-star text-warning" :"fa fa-star "}/>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className="card-body  px-4">
                                    <p className="mb-0 d-flex justify-content-between"><span className="font-small text-muted">Gender: </span><span >{card.gender}</span></p>
                                    <p className="mb-0 d-flex justify-content-between "><span className="font-small  text-muted">Species: </span>{card.species}</p>
                                    {card?.type && <p className="mb-0  d-flex justify-content-between"><span className="font-small  text-muted">Type: </span>{card?.type}</p>
                                    }
                                    <p className="mb-0 d-flex justify-content-between"><span className="font-small text-muted">Status</span>{card.status}</p>
                                    <p className="mb-0 d-flex justify-content-between"><span className="font-small text-muted">Location: </span> {card.location.name}</p>
                                    <p className="mb-0 d-flex justify-content-between"><span className="font-small text-muted">Origin: </span> {card.origin.name}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </React.Fragment>
    )
};
export default MindBowser;