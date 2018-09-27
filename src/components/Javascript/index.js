import React, { Component } from 'react';
import { Grid, Row } from 'react-bootstrap';
import Table from '../Table/index';
import { Button, Loading } from '../Button/index';
import Search from '../Search/index';
// import Search from '../Search/index';

import {
	DEFAULT_QUERY,
	DEFAULT_PAGE,
	DEFAULT_HPP,
	PATH_BASE,
	PATH_SEARCH,
	PARAM_SEARCH,
	PARAM_PAGE,
	PARAM_HPP
} from '../../constants/index';


const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}${DEFAULT_PAGE}&${PARAM_HPP}${DEFAULT_HPP}`;
console.log(url);



const withLoading = (Component) => ({isLoading, ...rest}) =>
	isLoading ? <Loading /> : <Component {...rest}/>

const updateTopStories = (hits, page) => (prevState) => {
	const { searchKey, results } = prevState;
	const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
	const updatedHits = [...oldHits, ...hits];

	return {results: {...results, [searchKey]: {hits : updatedHits, page}}, isLoading:false}
}

class Javascript extends Component {

	constructor(props){
		super(props);

		this.state = {
			results : null,
			searchKey : '',
			searchTerm : 'javascript',
			isLoading :false,
			
		}

		this.removeItem = this.removeItem.bind(this);
		this.searchValue = this.searchValue.bind(this);
		this.fetchTopStories = this.fetchTopStories.bind(this);
		this.setTopStories = this.setTopStories.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		
	}

	

	checkTopStoriesSearchTerm(searchTerm){
		return !this.state.results[searchTerm];
	}

	setTopStories(result){
		const { hits, page } = result;

		this.setState(updateTopStories(hits, page));
	}

	fetchTopStories(searchTerm, page, hpp){
		this.setState({isLoading: true})
		fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${hpp}`)
			.then(response => response.json())
			.then(result => this.setTopStories(result))
			.catch(e => e);
	}

	componentDidMount(){
		const { searchTerm } = this.state;
		this.setState({ searchKey: searchTerm });
		this.fetchTopStories(searchTerm, DEFAULT_PAGE, DEFAULT_HPP);
	}

	onSubmit(event){
		const { searchTerm } = this.state;
		this.setState({ searchKey: searchTerm });

		if(this.checkTopStoriesSearchTerm(searchTerm)){
			this.fetchTopStories(this.state.searchTerm, DEFAULT_PAGE, DEFAULT_HPP);
		}
		
		event.preventDefault();
	}

	removeItem(id){
		const { results, searchKey } = this.state;
		const { hits, page } = results[searchKey];

		const updatedList = hits.filter(item => item.objectID !== id);

		// this.setState({ result: Object.assign({}, this.state.result, {hits: updatedList})});
		this.setState({results: {...results, [searchKey]: {hits: updatedList, page}}})
	}

	searchValue(event){
		this.setState({searchTerm: event.target.value});
	}

	render() {
		const { results, searchTerm, searchKey, isLoading} = this.state;

		// if(!result){return null;}
		const page = (results && results[searchKey] && results[searchKey].page) || 0; 

		const list = (results && results[searchKey] && results[searchKey].hits) || [];
		// const page = (result && result.page) || 0; 
	    return (
	          <div>
	          		<Grid>
	          			<Row>          		
			          		<Table 
			          			list = { list}
			          			removeItem = { this.removeItem }
			          			searchTerm = { searchTerm }
			          		/> 

			          		<div className="text-center alert">
			          			
			          				<ButtonWithLoading
			          					isLoading = { isLoading }
				          				className="btn btn-success"
				          				onClick={ () => this.fetchTopStories(searchTerm, page + 1, DEFAULT_HPP)}
				          			>
				          				Load more
				          			</ButtonWithLoading>
			          			
			          		</div>
	          			</Row>
	          		</Grid>	
	                
	          </div>
	    );
	}
}

const ButtonWithLoading = withLoading(Button);
export default Javascript;
