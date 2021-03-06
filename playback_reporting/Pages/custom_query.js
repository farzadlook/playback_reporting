/*
Copyright(C) 2018

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see<http://www.gnu.org/licenses/>.
*/

define(['mainTabsManager', Dashboard.getConfigurationResourceUrl('helper_function.js')], function (mainTabsManager) {
    'use strict';


    ApiClient.sendCustomQuery = function (url_to_get, query_data) {
        var post_data = JSON.stringify(query_data);
        console.log("sendCustomQuery url  = " + url_to_get);
        console.log("sendCustomQuery data = " + post_data);
        return this.ajax({
            type: "POST",
            url: url_to_get,
            dataType: "json",
            data: post_data,
            contentType: 'application/json'
        });
    };

    return function (view, params) {

        // init code here
        view.addEventListener('viewshow', function (e) {

            mainTabsManager.setTabs(this, getTabIndex("custom_query"), getTabs);

            var run_custom_query = view.querySelector('#run_custom_query');
            run_custom_query.addEventListener("click", runQuery);

            function runQuery() {

                var custom_query = view.querySelector('#custom_query_text');
                var replace_userid = view.querySelector('#replace_userid').checked;

                //alert("Running: " + custom_query.value);

                var message_div = view.querySelector('#query_result_message');
                message_div.innerHTML = "";
                var table_body = view.querySelector('#custom_query_results');
                table_body.innerHTML = "";

                var url = "user_usage_stats/submit_custom_query?stamp=" + new Date().getTime();
                url = ApiClient.getUrl(url);

                var query_data = {
                    CustomQueryString: custom_query.value,
                    ReplaceUserId: replace_userid
                };

                ApiClient.sendCustomQuery(url, query_data).then(function (result) {
                    //alert("Loaded Data: " + JSON.stringify(result));

                    var message = result["message"];

                    if (message !== "") {
                        var message_div = view.querySelector('#query_result_message');
                        message_div.innerHTML = message;
                    }
                    else {
                        // build the table
                        var table_row_html = "";

                        // add table heading
                        var result_ladels = result["colums"];
                        table_row_html += "<tr class='detailTableBodyRow detailTableBodyRow-shaded'>";
                        for (var index = 0; index < result_ladels.length; ++index) {
                            var colum_name = result_ladels[index];
                            table_row_html += "<td style='white-space: nowrap;'><strong>" + colum_name + "</strong></td>";
                        }
                        table_row_html += "</tr>";

                        // add the data
                        var result_data_rows = result["results"];
                        for (var index2 = 0; index2 < result_data_rows.length; ++index2) {
                            var row_data = result_data_rows[index2];
                            table_row_html += "<tr class='detailTableBodyRow detailTableBodyRow-shaded'>";

                            for (var index3 = 0; index3 < row_data.length; ++index3) {
                                var cell_data = row_data[index3];
                                table_row_html += "<td style='white-space: nowrap;'>" + cell_data + "</td>";
                            }

                            table_row_html += "</tr>";
                        }

                        var table_area_div = view.querySelector('#table_area_div');
                        table_area_div.setAttribute("style", "overflow:hidden;");
                        
                        var table_body = view.querySelector('#custom_query_results');
                        table_body.innerHTML = table_row_html;

                        table_area_div.setAttribute("style", "overflow:auto;");
                        
                        let isDown = false;
                        let startX;
                        let scrollLeft;

                        table_area_div.addEventListener('mousedown', (e) => {
                            isDown = true;
                            //table_area_div.classList.add('active');
                            startX = e.pageX - table_area_div.offsetLeft;
                            scrollLeft = table_area_div.scrollLeft;
                        });
                        table_area_div.addEventListener('mouseleave', () => {
                            isDown = false;
                            //table_area_div.classList.remove('active');
                        });
                        table_area_div.addEventListener('mouseup', () => {
                            isDown = false;
                            //table_area_div.classList.remove('active');
                        });
                        table_area_div.addEventListener('mousemove', (e) => {
                            if (!isDown) return;
                            e.preventDefault();
                            const x = e.pageX - table_area_div.offsetLeft;
                            const walk = (x - startX) * 1; //scroll-fast, for now set to 1 for 1:1 scrolling
                            table_area_div.scrollLeft = scrollLeft - walk;
                            //console.log(walk);
                        });
                        
                    }
                });
            }

        });

        view.addEventListener('viewhide', function (e) {

        });

        view.addEventListener('viewdestroy', function (e) {

        });
    };
});