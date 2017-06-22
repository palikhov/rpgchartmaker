/**
 *   RPG Chart Maker source file MainMenu,
 *   Copyright (C) 2016  James M Adams
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Lesser General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Lesser General Public License for more details.
 *
 *   You should have received a copy of the GNU Lesser General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @see index.html
 */
function MainMenu(){
	//data
	this.node=undefined;


	/**
	 * constructor
	 */
	this._constructor = function(){
		this._setup();
	};


	/**
	 *
	 */
	this._setup=function(){
		this.node = $('.menuBar');
		HasOpenMenuButtons.call(this);
		HasAddMenu.call(this);
		HasSaveMenu.call(this);
		HasLoadMenu.call(this);
		HassRollButton.call(this);
    HasListNameInput.call(this);

		$.getJSON('config.json',$.proxy(function(data){
			if(data.enableShare){
				this.node.find('.shareButton').css('display','inline-block');
				this.servlet=data.servlet;
				this._setupShare();
				this._setupRetrieve();
			}
		},this));
	};


	/**
	 *
	 */
	this._setupShare=function(){
		this.node.find('.shareButton').click($.proxy(function(event){
			event.preventDefault();

			//verify that chart name isn't empty

			var listNameInput =this.node.find('input[name=listName]');

			if(listNameInput.val()!==''){
				data ={};
				data.chart = this.gatherData();
				data.requestType='store';

				$.ajax(this.servlet,{'data':data, dataType:'json', method:'POST'}).done(function(data){
					if(data.success){
						window.location.hash = data.id;
					}
				}).fail(function(msg){
					console.warn('failed call to chartStore',msg.responseText)
				});
			}else{
				listNameInput.addClass('error');
			}
		},this));
	};


	/**
	 *
	 */
	this._setupRetrieve=function(){
		var hash = window.location.hash;

		if(hash!==''){
			var data={requestType:"retrieve",id:hash.substring(1)};

			$.ajax(this.servlet,{'data':data,dataType:'json', method:'POST'}).done($.proxy(function(response){
				if(response.success){
					this.clearAll();
					this.loadData(response.data,false);
				}
			},this)).fail(function(msg){
				console.warn('failed call to chartStore',msg.responseText)
			});
		}
	};


	/**
	 *
	 */
	this.gatherData=function(){
		var data = {};
		data.name=this.node.find('input[name=listName]').val();

		var saveType = $('.hamburger select[name="saveList"]').val();

		if(saveType==='all'){
			this.gatherRolls(data);
			this.gatherLists(data);
		}else if(saveType==='lists'){
			this.gatherLists(data);
		} else if(saveType==='rolls'){
			this.gatherRolls(data);
		}

		return data;
	};


	/**
	 *
	 */
	this.gatherRolls=function(data){
		//gather rolls
		data.rolls=[];
		$('.listGroupContainer .rollContainer').each(function(index, item){
			var obj = {};
			var coreNode = $(item).data("coreNode");

			//resolve alias
			if($.isEmptyObject(coreNode.alias)===false){
				obj.alias = coreNode.alias;
			}

			//resolve display
			if($.isEmptyObject(coreNode.display)===false){
				obj.display = coreNode.display;
			}

			//resolve type
			if(coreNode instanceof SeedRollContainer){
				obj.seed = coreNode.seed;
				//alias is not empt
				obj.type = "RollContainer";
			}
			data.rolls.push(obj);
		});
	}


	/**
	 *
	 */
	this.gatherLists=function(data){
		//gather lists
		data.lists=[];
		$('.listGroupContainer .list').each(function(index, item){
			var obj = {};

			//get list name
			obj.name= $(item).find('input[name=listGroupName]').val();

			//get get roll checkbox
			obj.roll= $(item).find('input[name="roll"]').prop('checked');

			//initialize list entries
			obj.list=[];

			if($(item).hasClass('listGroup')){
				//fill out type
				obj.type='ListGroup';

				//fill out list
				$(this).find('ol li span.nameText').each(function(index, item){
					obj.list.push($(item).text());
				});
			}else if($(item).hasClass('objectGroup')){
				//fill out type
				obj.type='ObjectGroup';

				//fill out order
				obj.order=[];

				$(this).find('.objectForm .objectInput').each(function(index, item){
					var data ={};
					data.label = $(item).data('label');
					data.type = $(item).data('type');
					obj.order.push(data);
				});

				//fill out list
				$(this).find('ol li .object').each(function(index, item){
					obj.list.push($(item).data('json'));
				});
			}

			data.lists.push(obj);
		});
	}


	/**
	 *
	 */
	this.saveAsFile=function(t,f,m) {
		try {
			var b = new Blob([t],{type:m});
			saveAs(b, f);
		} catch (e) {
			window.open("data:"+m+"," + encodeURIComponent(t), '_blank','');
		}
	};


	/**
	 *
	 */
	this.loadData=function(data,animate){
		this.loadChartName(data);

		var loadType = $('.hamburger select[name="loadList"]').val();

		if(loadType==='all'){
			this.loadRolls(data,animate);
			this.loadLists(data,animate);
		} else if(loadType==='lists'){
			this.loadLists(data,animate);
		} else if(loadType==="rolls"){
			this.loadRolls(data,animate);
		}
	};


	/**
	 * set chart name
	 */
	this.loadChartName=function(data){
		this.node.find('input[name=listName]').val(data.name).trigger('input');
	};


	/**
	 *
	 */
	this.loadRolls=function(data,animate){
		if(data.rolls){
			for(var i=0, roll;(roll=data.rolls[i]);i++){
				var rContainer;
				if(roll.type==="RollContainer"){
					//console.log('loadRolls instantiate SeedRollContainer');
					rContainer = new SeedRollContainer(animate);
				}else if(roll.type==="SeedRollContainer"){
					rContainer = new SeedRollContainer(animate);
				}

				if(rContainer && rContainer.node){
					rContainer.fillOut(roll);
				}else{
					$(rContainer).on('loaded',function(roll){
						this.fillOut(roll);
					}.bind(rContainer,roll));
				}
			}
		}else{
			var rollContainer = new SeedRollContainer(animate);
		}
	};


	/**
	 *
	 */
	this.loadLists=function(data,animate){
		//go through each list in the data object
		for(var i=0,list;(list=data.lists[i]);i++){
			//placeholder
			var listGroup;

			if(list && list.type == 'ListGroup'){
				listGroup = new ListGroup(animate);
			}else if(list && list.type == 'ObjectGroup'){
				listGroup = new ObjectGroup(animate);
			}else if(list){
				//for older lists import
				listGroup = new ListGroup(animate);
			}

			if(listGroup.node){
				listGroup.fillOutList(list);
			}else{
				$(listGroup).on('loaded',function(list){
					this.fillOutList(list);
				}.bind(listGroup,list));
			}
		}
	}


	/**
	 *
	 */
	this.clearAll=function(){
		if($('.hamburger select[name="clearList"]').val()==="all"){
			$('.list, .rollContainer').remove();
		} else if($('.hamburger select[name="clearList"]').val()==="lists"){
			$('.list').remove();
		} else if($('.hamburger select[name="clearList"]').val()==="rolls"){
			$('.rollContainer').remove();
		}
	};


	//main
	this._constructor();
}
