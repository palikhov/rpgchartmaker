/**
 *   RPG Chart Maker source file HasRoll,
 *   Copyright (C) 2017  James M Adams
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
 * Roll Mixin.
 * @mixin
 */
function HasRoll(){
  this.rollArrayLookup={};


  /**
   *
   */
  this.roll=function(){
    this.rollTable = this.node.find('table');
    this.clearTitle();
    this.resetState();
    this.createIndex();
    this.createTableHeader();
    this.createTableRows();
    this.clearRollArrayLookup();

    $(this.rollTable).trigger("updateAll");
  };


  /**
   *
   */
  this.clearTitle=function(){
    //change the rollContainers titles color
    this.node.find('.title').css('color','#fff');
  };


  /**
   *
   */
  this.resetState=function(){
    //reset state
    this.rollTable.find('th').remove();
    this.rollTable.find('tbody tr').remove();
  };

  /**
   *
   */
  this.createIndex=function(){
    $('.list').each($.proxy(function(index,item){
      $(item).attr('data-index',index);
    },this));
  };


  /**
   *
   */
  this.createTableHeader=function(){
    //fill out headers
    if(this.resolveDisplay('No.')){
      this.rollTable.find('thead tr').append('<th data-name="'+'No.'+'">'+this.resolveAlias('No.')+'</th>');
    }

    $('.list').each($.proxy(function(index,item){
      var label = $(item).attr('data-name');
      var coreNode = $(item).data('coreNode');
      var roll = coreNode.rollValue;

      //make sure it's not skipped
      if(this.resolveDisplay(label)){
        if(roll){
          this.rollTable.find('thead tr').append('<th data-name="'+label+'">'+this.resolveAlias(label)+'</th>');
        }
      }
    },this));
  };


  /**
   *
   */
  this.resolveAlias=function(column){
      if(this.alias && this.alias[column]){
        return this.alias[column];
      }
      return column;
  };


  /**
   *
   */
  this.resolveDisplay=function(column){
      if(this.display && this.display[column]===false){
        return false;
      }
      return true;
  };


  /**
   *
   */
  this.createTableRows=function(){
    //fill out rows
    //console.log('createTableRows');
    var count = $('input[name="rollCount"]').val();
    var lists =$('.list');

    for(var i=0;i<count;i++){
      this.rollTable.find('tbody').append('<tr data-rollSet="'+i+'"></tr>');

      if(this.resolveDisplay('No.')){
        //add roll Index
        this.rollTable.find('tbody tr:last-child').append('<td>'+(i+1)+'</td>');
      }

      lists.each($.proxy(this.getRollValue,this));
    }
  };


  /**
   *
   */
  this.getRollValue=function(index, item){
    //resolve list name
    var label = $(item).attr('data-name');

    if(this.resolveDisplay(label)){
      rollValue = this.rollList({"index":index,"item":item});

      if(rollValue!==undefined){
        this.rollTable.find('tbody tr:last-child').append('<td>'+rollValue+'</td>');
      }
    }
  };


  /**
   * Potentially a recursive call, depending on how the user structured their data.
   */
  this.rollList=function(p){
    if(p.index===undefined || p.item===undefined){
      throw 'rollList is missing required parameters';
    }

    var coreNode = $(p.item).data('coreNode');

    //make sure it's not skipped
    if(p.forceRoll || coreNode.rollValue){
      p.label = $(p.item).attr('data-name');
      p.arr = this.createRollArray(p);
      p.roll = this.resolveRoll(p.arr, p.label);
      var value = this.resolveRollValue(p.index,p.item, p.arr, p.roll);
      this.resolveUnique(p);
      return value;
    }
  };


  /**
   *
   */
  this.resolveRollValue=function(index,list, arr, roll){
    if(arr.length>0){
      var value = arr[roll];

      //lookup for dice
      value = this.findList(value);
      value = this.findDice(value);

      //animate the roll selection
      $(list).find('ol li:nth-child('+(roll+1)+')').animateCss('highlight');

      return value;
    } else {
      return '';
    }
  };


  /**
   *
   */
  this.resolveUnique=function(p){
    if(p.item===undefined || p.roll===undefined || p.arr===undefined || p.index===undefined || p.label===undefined){
      throw 'resolveUnique is missing required parameters';
    }

    var coreNode = $(p.item).data('coreNode');

    if(coreNode.unique===true){
      if (p.roll > -1) {
        p.arr.splice(p.roll, 1);
      }

      if(p.arr.length === 0){
        this.rollArrayLookup[p.label+p.index]=undefined;
        this.createRollArray(p);
      }
    }
  };


  /**
   *
   */
  this.createRollArray=function(p){
    if(p.index===undefined || p.label===undefined || p.item===undefined){
      throw 'createRollArray is missing required parameters';
    }
    var namespace = p.label+p.index;

    //lookup array is empty
    if(this.rollArrayLookup[namespace]===undefined){
      var arr = [];

      if(p.qualifier && p.qualifier!==''){
        var sub  = p.qualifier.split(',');

        for(var i=0;i<sub.length;i++){
          var node = $(p.item).find('ol li:nth-child('+sub[i].trim()+')');
          arr.push(node.html());
        }
      }else{
        //place list item contents into an array
        arr = $(p.item).find('ol li').not('.edit').map(function(i, el) {
          return $(el).html();
        }).get();
      }

      this.rollArrayLookup[namespace] = arr;
    }

    return this.rollArrayLookup[namespace];
  };


  /**
   *
   */
  this.clearRollArrayLookup=function(){
    this.rollArrayLookup={};
  };


  /**
   * no longer used
   * @see HasRollSeed.js
   */
  this.resolveRoll=function(arr){
    var roll = Math.floor(Math.random() * arr.length);
    console.log('resolve roll',roll);
    return roll;
  };


  /**
   * d40444 Demonkin d5 d6+1 d6/2 d4*10 d6-1
   * should have 6 matches d40444, d5, d6+1, d6/2, d4*10, and d6-1
   */
  this.findDice=function(text){
    var re = /\bd(\d+)([*+-/%]?)(\d+)?\b/gi;

    text = text.replace(re,function(match,number, operation, number2){
      var n = parseInt(number);
      var roll = Math.floor(Math.random() * n);
      //normalize roll so that it's not 0 index
      roll++;

      //modify roll
      if(operation && number2 && operation !==''){
        var n2 = parseInt(number2);

        if(operation=='+'){
          roll = roll+n2;
        }else if(operation=='-'){
          roll = roll-n2;
        }else if(operation=='/'){
          roll = roll/n2;
        }else if(operation=='*'){
          roll = roll*n2;
        }else if(operation=='%'){
          roll = roll%n2;
        }
      }
      return roll;
    });
    return text;
  };


  /**
   * d6 [Region](1,5) Orks - [Type]
   * Hits on Type, and Region subset 1, and 5.
   */
  this.findList=function(text){
    var re = /\[(.*?)\]\(?([\d,]*)\)?/gi;

    text = text.replace(re,$.proxy(function(match,listName,qualifier){
      var returner = match;
      if(listName && listName!==''){
        var item = $('.list[data-name="'+listName+'"]');
        var index = $(item).data('index');
        //find the index
        if(index===undefined){
          console.warn="index is undefined";
          index=0;
        }
        return this.rollList({"index":index,"item":item,"forceRoll":true,"qualifier":qualifier});
      }
      return returner;
    },this));
    return text;
  };
}
