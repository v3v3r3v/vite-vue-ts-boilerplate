import { RouteComponent, RouteMeta, RouteRecordRaw } from 'vue-router'

type LazyComponent = () => Promise<RouteComponent>

interface RouteMetaCheckIsParent extends RouteMeta {
  isParent(path: string[]): boolean
}

// Compares elements of two arrays
function equals<T>(a: T[], b: T[]) {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

// Search for route which is parent of nested route with path
// https://router.vuejs.org/guide/essentials/nested-routes.html
function findCommonChild(
  nodes: RouteRecordRaw[],
  path: string[],
  offset: number
): RouteRecordRaw {
  const node = nodes.find(
    (node) =>
      Array.isArray(node.children) &&
      (node.meta as RouteMetaCheckIsParent).isParent(path)
  )

  if (node === undefined || node.children === undefined) {
    throw new Error('Unable to find child')
  } else if (node.children.length == 0 || offset + 1 == path.length) {
    return node
  } else {
    try {
      return findCommonChild(node.children, path, offset + 1)
    } catch (e) {
      return node
    }
  }
}

// Important: _x_ prefix of layout must be smaller then index
// because localeCompare used for sorting items before creating routes
const COMPONENT_LAYOUT_KEY = '_0_layout'
const COMPONENT_INDEX_KEY = '_1_index'
const COMPONENT_PAGE_NOT_FOUND_KEY = '_2_404'

// Create new route record
function createRouteRecord(
  path: string[],
  component: LazyComponent
): RouteRecordRaw {
  return {
    path: path
      .map((v) => v.replace(/^_/, ':'))
      .join('/')
      .replaceAll(/(\/)+/g, '/'),
    component,
  }
}

function createNode(path: string[], component: LazyComponent): RouteRecordRaw {
  if (path[path.length - 1] == COMPONENT_LAYOUT_KEY) {
    const metaPath = path.slice(0, -1)
    const meta = {
      isParent: (childPath: string[]) =>
        equals(metaPath, childPath.slice(0, metaPath.length)),
    }
    if (path.length === 2) {
      path[path.length - 1] = ''
    } else {
      path.pop()
    }
    return {
      ...createRouteRecord(path, component),
      children: [],
      meta,
    }
  }

  if (path[path.length - 1] == COMPONENT_INDEX_KEY) {
    path.pop()
  }

  if (path[path.length - 1] == COMPONENT_PAGE_NOT_FOUND_KEY) {
    path[path.length - 1] = ':pathMatch(.*)'
  }

  return createRouteRecord(path, component)
}

function addComponentToRoute(
  routes: RouteRecordRaw[],
  path: string,
  component: LazyComponent
) {
  const parts = path.split('/')

  try {
    const node = findCommonChild(routes, parts, 0)
    if (node.children === undefined) {
      throw new Error('Found node without children')
    }
    node.children.push(createNode(parts, component))
  } catch (e) {
    routes.push(createNode(parts, component))
  }

  return routes
}

export default function getRoutes(routes: RouteRecordRaw[]) {
  const pages = import.meta.glob('../../pages/**/*.vue')
  const regex = new RegExp('../../pages(.*).vue$')

  return Object.entries(pages)
    .map(([path, component]) => {
      const matched = path.match(regex)
      if (matched === null) {
        throw new Error('Error searching path substring')
      }
      return [matched[1].toLowerCase(), component] as [string, LazyComponent]
    })
    .map(
      ([path, component]) =>
        [path.replace('__layout', COMPONENT_LAYOUT_KEY), component] as [
          string,
          LazyComponent
        ]
    )
    .map(
      ([path, component]) =>
        [path.replace('__index', COMPONENT_INDEX_KEY), component] as [
          string,
          LazyComponent
        ]
    )
    .map(
      ([path, component]) =>
        [path.replace('__404', COMPONENT_PAGE_NOT_FOUND_KEY), component] as [
          string,
          LazyComponent
        ]
    )
    .sort((a: [string, LazyComponent], b: [string, LazyComponent]) =>
      a[0].localeCompare(b[0])
    )
    .reduce(
      (routes: RouteRecordRaw[], v) => addComponentToRoute(routes, v[0], v[1]),
      routes
    )
}
