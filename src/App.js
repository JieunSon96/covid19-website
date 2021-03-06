import React, {useEffect, useState} from "react";
import{
  MenuItem,
  FormControl,
  Select,
  CardContent,
  Card
}from "@material-ui/core";
import InfoBox from "./InfoBox";
import MapContainer from './MapContainer';
import Table from "./Table";
import './App.css';
import { sortData , prettyPrintStat} from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
  
const[countries,setCountries] = useState([]);
const[country,setInputCountry]=useState('worldwide');
const[countryInfo,setCountryInfo] =useState({});
const[tableData,setTableData]=useState([]);
const [mapCountries, setMapCountries] = useState([]);
const [casesType, setCasesType] = useState('cases');
const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
const [mapZoom, setMapZoom] = useState(3);


useEffect(()=>{
fetch("https://disease.sh/v3/covid-19/all")
.then(response=>response.json())
.then(data=>{
  setCountryInfo(data);
})
},[])

  // state= how to write a variable in REACT
  //https://disease.sh/v3/covid-19/countries

  // USEEFFECT = Runs a piece of code
  // based on a given condition

  useEffect(()=>{
  // The code inside here will run once
  // when the component loads and not again
  // async -> send a request, wait for it, do something with info
   
  const getCountriesData = async () => {
   await fetch("https://disease.sh/v3/covid-19/countries"
   ).then((response)=>response.json())
   .then((data)=>{
     const countries=data.map((country)=>(
       {
         name:country.country, //United States, Canada
         value:country.countryInfo.iso2 // UK, USA, CAN
       }
     ));

     const sortedData = sortData(data);
     setTableData(sortedData);
     setMapCountries(data);
     setCountries(countries);
   });
  };

  getCountriesData();
  },[]);


  const onCountryChange=async(event)=>{
    const countryCode=event.target.value;

   

    const url = countryCode ==='worldwide' 
    ? "https://disease.sh/v3/covid-19/all" 
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`
    await fetch(url)
    .then(response => response.json())
    .then(data=>{
    setInputCountry(countryCode);
     setCountryInfo(data);
     setMapCenter([data.countryInfo.lat,data.countryInfo.long]);
     setMapZoom(4);
    })
  }

  console.log("Country Info >>> ",countryInfo); 
  return (
    
    <div className="app">
      <div className="app__left">
      <div className="app__header">
      <h1>COVID-19 Tracker</h1>
    <FormControl className="app__dropdown">
     <Select variant="outlined" onChange={onCountryChange} value={country}>
     <MenuItem value="worldwide">Worldwide</MenuItem>
     {
       countries.map(country=>(
         <MenuItem value={country.value}>{country.name}</MenuItem>
       ))
     }
     </Select>
    </FormControl>
    </div>

     <div className="app__stats">
      <InfoBox isRed active={casesType === "cases"} onClick={e=>setCasesType('cases')} title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}></InfoBox>
      <InfoBox active={casesType === "recovered"} onClick={e=>setCasesType('recovered')} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}></InfoBox>
      <InfoBox isRed active={casesType === "deaths"}onClick={e=>setCasesType('deaths')} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}></InfoBox>
     </div>

     <MapContainer
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
     <Card className="app__right">
     <CardContent>
       <h3>Live Cases by Country</h3>
       <Table countries={tableData}/>
       <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
       <LineGraph className="app__graph" casesType={casesType}/>
     </CardContent>

     </Card>


    
    </div>
  );
}

export default App;
