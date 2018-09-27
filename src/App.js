import React, { Component } from 'react';
import list from './list'
import { Grid, Row, FormGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';

import {
	DEFAULT_QUERY,
	DEFAULT_PAGE,
	DEFAULT_HPP,
	PATH_BASE,
	PATH_SEARCH,
	PARAM_SEARCH,
	PARAM_PAGE,
	PARAM_HPP
} from './constants/index';

const SORTS = {
	NONE : list => list,
	TITLE : list => sortBy(list, 'title'),
	AUTHOR: list => sortBy(list, 'author'),
	COMMENTS: list => sortBy(list, 'num_comments').reverse(),
	POINTS:list => sortBy(list, 'points').reverse(),
}
// import './App.css';

// default parameters


const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}${DEFAULT_PAGE}&${PARAM_HPP}${DEFAULT_HPP}`;
console.log(url);

function isSearched(searchTerm){
	return function(item){
		return !searchTerm || item.title.toLowerCase().includes(searchTerm);
	}
}

const withLoading = (Component) => ({isLoading, ...rest}) =>
	isLoading ? <Loading /> : <Component {...rest}/>

const updateTopStories = (hits, page) => (prevState) => {
	const { searchKey, results } = prevState;
	const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
	const updatedHits = [...oldHits, ...hits];

	return {results: {...results, [searchKey]: {hits : updatedHits, page}}, isLoading:false}
}

class App extends Component {

	constructor(props){
		super(props);

		this.state = {
			results : null,
			searchKey : '',
			searchTerm : DEFAULT_QUERY,
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
	          		
	          		<Grid fluid>
	          			<Row>
	          				<div className="jumbotron text-center">
	          					<Search 
				          			onChange={ this.searchValue }
				          			value = { searchTerm }
				          			onSubmit = { this.onSubmit }
				          		>NEWSAPP</Search>
	          				</div>
	          			</Row>
	          		</Grid>	
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

class Search extends Component{
	componentDidMount(){
		this.input.focus();
	}
	render(){
		const { onChange, value, children, onSubmit } = this.props;
		return(
			<form onSubmit= { onSubmit }>
				<FormGroup>
					<h1 style={{ fontWeight: 'bold' }}>{ children }</h1>
					<hr style={{ border: '2px solid black', width:'100px'}}/>
					<div className="input-group">
			  			<input 
			  				className="form-control width100 searchForm"
			  				type="text" 
			  				onChange={ onChange } 
			  				value={ value } 
			  				ref={(node) => {this.input = node}}
			  			/>
			  			<span className="input-group-btn">
			  				<button
			  					className="btn btn-primary searchBtn"
			  					type="submit"
			  				>
			  					Search
			  				</button>
			  			</span>
		  			</div>
	  			</FormGroup>	
	  		</form>
		)
	}
}

// const Table = ({ list, searchTerm, removeItem, sortKey, onSort, isSortReverse }) => {
class Table extends Component {

	constructor(props){
		super(props);

		this.state = {
			sortKey: 'NONE',
			isSortReverse : false
		}
		this.onSort = this.onSort.bind(this);
	}

	onSort(sortKey){
		const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
		this.setState({sortKey, isSortReverse});
	}

	render(){
		const { list, removeItem, searchTerm} = this.props;
		const { sortKey, isSortReverse } = this.state;
		const sortedList = SORTS[sortKey](list);
		const reversSortedList = isSortReverse ? sortedList.reverse() : sortedList;
		return(
			<div className="col-ms-10 col-sm-offset-1">

				<div className="text-center">

					<hr /> 
					<Sort
						className="btn btn-xsbtn-dfault sortBtn"
						sortKey={'NONE'}
						onSort={ this.onSort }
						activeSortKey={ sortKey }
					>Default</Sort>

					<Sort
						className="btn btn-xsbtn-dfault sortBtn"
						sortKey={'TITLE'}
						onSort={ this.onSort }
						activeSortKey={ sortKey }
					>Title</Sort>
					<Sort
						className="btn btn-xsbtn-dfault sortBtn"
						sortKey={'AUTHOR'}
						onSort={ this.onSort }
						activeSortKey={ sortKey }
					>Author</Sort>
					<Sort
						className="btn btn-xsbtn-dfault sortBtn"
						sortKey={'COMMENTS'}
						onSort={ this.onSort }
						activeSortKey={ sortKey }
					>Comments</Sort>
					<Sort
						className="btn btn-xsbtn-dfault sortBtn"
						sortKey={'POINTS'}
						onSort={ this.onSort }
						activeSortKey={ sortKey }
					>Points</Sort>

					<hr />
				</div>
				{
					
	            	reversSortedList.filter(isSearched(searchTerm)).map(item =>
	            	// list.map(item =>
	            		<div key={item.objectID}> 
	    					<h1><a href={item.url}>{item.title}</a> by {item.author}</h1>
	    					<h4>{item.num_comments} Comments | {item.points} Points

		    					<Button 
		    						className="btn btn-danger btn-xs removeBtn"
		    						onClick={() => removeItem(item.objectID)}
		    					>Remove Me</Button>
	    					</h4>
	    					<hr />
	    				</div>
	            	)
	            } 
			</div>
		)
	} 
	
}

Table.propTypes ={
	list: PropTypes.arrayOf(
		PropTypes.shape({
			objectID:PropTypes.string.isRequired,
			author:PropTypes.string,
			url:PropTypes.string,
			num_comments:PropTypes.number,
			points:PropTypes.number
		})
	).isRequired,
	removeItem: PropTypes.func.isRequired,
}

const Button = ({ onClick, children, className='' }) => 
	// return(
		<button
			className={ className }
			type = "button"
			onClick={ onClick }
		>{ children }</button>

Button.propTypes = {
	onClick: PropTypes.func.isRequired,
	className: PropTypes.string,
	children: PropTypes.node
}

Button.defaultProps = {
	className: ''
}

const Loading = () =>
	<div>
		<h2>Loading...</h2>
	</div>

const ButtonWithLoading = withLoading(Button);

const Sort = ({ sortKey, onSort, children, className, activeSortKey }) => {
	const sortClass = ['btn default'];
	if(sortKey === activeSortKey){
		sortClass.push('btn btn-primary');
	}
	return(
		<Button
			className= { sortClass.join(' ') }
			onClick={() => onSort(sortKey)}
		>{children}</Button>);
}
	
// class Button extends Component {
// 	render() {
// 		const { onClick, children } = this.props;
// 		return(
// 			<button
// 				type = "button"
// 				onClick={ onClick }
// 			>{ children }</button>
// 		)
// 	}
// }

// function Button({ onClick, children }){
// 	return(
// 		<button
// 			type = "button"
// 			onClick={ onClick }
// 		>{ children }</button>
// 	)
// }


	// )


export default App;
