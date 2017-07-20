/**
 *   RPG Chart Maker source file HasListGroupLoad,
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
 * List Group Load Mixin.
 * @mixin
 */
function HasListGroupLoad(){


  /**
   * Load list name, and ol list with data.
   * @param {Object} list - JSON List Data.
   */
  this.fillOutList=function(list){

    //fill out name
    this.node.find('input[name=listGroupName]').val(list.name).trigger('input');

    //fill out roll
    if(list.roll!==undefined){
      if(list.roll=='true'){
        list.roll = true;
      }else if(list.roll=='false'){
        list.roll=false;
      }
      this.setRollValue(list.roll);
    }

    //fill out unique
    if(list.unique!==undefined){
      if(list.unique=='true'){
        list.unique = true;
      }else if(list.unique=='false'){
        list.unique=false;
      }
      this.setUnique(list.unique);
    }

    //fill out List
    for(var j=0,item;(item=list.list[j]);j++){
      this.AddToList(item);
    }
  };
}
