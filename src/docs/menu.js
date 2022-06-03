/********************************************************************************
 * Copyright (C) 2020 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

const M = (title, path, subMenu, indented = false) => ({
    title,
    path: '/docs/' + (path ? path + '/' : ''),
    subMenu,
    indented
})

export const MENU = [
    {
        title: '概述'
    },
    M(
        '起步',
        'getting_started'
    ),
    M(
        '架构概述',
        'architecture'
    ),
    M(
        '项目目标',
        'project_goals'
    ),
    M(
        '扩展和插件',
        'extensions'
    ),
    M(
        '服务和贡献',
        'services_and_contributions'
    ),
    {
        title: '使用 Theia'
    },
    M(
        '构建自己的 IDE 工具',
        'composing_applications'
    ),
    M(
        '开发扩展',
        'authoring_extensions'
    ),
    M(
        '开发插件',
        'authoring_plugins'
    ),
    M(
        '添加语言支持',
        'language_support'
    ),
    M(
        'TextMate 高亮',
        'textmate',
        null,
        true
    ),
    {
        title: '核心 API'
    },
    M(
        '命令/菜单/快捷键',
        'commands_keybindings'
    ),
    M(
        'Widgets',
        'widgets'
    ),
    M(
        '首选项（偏好设置）',
        'preferences'
    ),
    M(
        '标签提供者',
        'label_provider'
    ),
    M(
        '消息服务',
        'message_service'
    ),
    M(
        '属性视图',
        'property_view'
    ),
    M(
        '事件',
        'events'
    ),
    M(
        '前端扩展点',
        'frontend_application_contribution'
    ),
    M(
        '后台扩展点',
        'backend_application_contribution'
    ),
    M(
        'JSON-RPC 通信',
        'json_rpc'
    ),
    M(
        '任务',
        'tasks'
    ),
    M(
        '国际化',
        'i18n'
    ),
    M(
        '高阶技巧',
        'tips'
    ),
    {
        title: 'Theia Blueprint'
    },
    M(
        '下载',
        'blueprint_download'
    ),
    M(
        '必读资料',
        'blueprint_documentation'
    )
]

export function getMenuContext(slug, menu = MENU, context = {}) {
    const indexOfCurrent = menu.findIndex(({path}) => {
        if (path) {
            return path.includes(slug)
        }
        return false
    })
    const prev =  menu[indexOfCurrent - 1] && menu[indexOfCurrent - 1].path ?
        menu[indexOfCurrent - 1].path : menu[indexOfCurrent - 2] && 
        menu[indexOfCurrent - 2].path && menu[indexOfCurrent - 2].path

    const prevTitle = menu[indexOfCurrent - 1] && menu[indexOfCurrent - 1].path ?
        menu[indexOfCurrent - 1].title :
        menu[indexOfCurrent - 2] && menu[indexOfCurrent - 2].path && 
        menu[indexOfCurrent - 2].title
    
    const next = menu[indexOfCurrent + 1] && menu[indexOfCurrent + 1].path ?
        menu[indexOfCurrent + 1].path : menu[indexOfCurrent + 2] && 
        menu[indexOfCurrent + 2].path && menu[indexOfCurrent + 2].path

    const nextTitle = menu[indexOfCurrent + 1] && menu[indexOfCurrent + 1].path ?
        menu[indexOfCurrent + 1].title :
        menu[indexOfCurrent + 2] && menu[indexOfCurrent + 2].path && 
        menu[indexOfCurrent + 2].title

    return { 
        prev: prev, 
        prevTitle, 
        next: next, 
        nextTitle 
    }
}
