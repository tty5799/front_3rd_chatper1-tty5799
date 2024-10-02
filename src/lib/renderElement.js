// renderElement.js
import { addEvent, removeEvent, setupEventListeners } from './eventManager';
import { createElement__v2 } from './createElement__v2.js';

// TODO: processVNode 함수 구현
function processVNode(vNode) {
  // null, undefined, boolean 값 처리
  if (!vNode) {
    return '';
  }

  // 문자열과 숫자를 문자열로 변환
  if (typeof vNode === 'string' || typeof vNode === 'number') {
    return String(vNode);
  }

  // 함수형 컴포넌트 처리
  if (typeof vNode.type === 'function') {
    return processVNode(vNode.type(vNode.props || {}));
  }

  return {
    ...vNode,
    children: vNode.children.map(processVNode).filter(Boolean) || [],
  };
}

// TODO: updateAttributes 함수 구현
function updateAttributes(targetEl, newVNodeProps, oldVNodeProps) {
  oldVNodeProps = oldVNodeProps || {};
  newVNodeProps = newVNodeProps || {};

  // 이전 props에서 제거된 속성 처리
  Object.entries(oldVNodeProps).forEach(([key, value]) => {
    if (!(key in newVNodeProps)) {
      if (key.startsWith('on')) {
        const eventType = key.toLowerCase().substring(2);
        console.log('delete event');
        removeEvent(targetEl, eventType, value);
      } else if (key === 'className') {
        targetEl.removeAttribute('class');
      } else {
        targetEl.removeAttribute(key);
      }
    }
  });

  // 새로운 props의 속성 추가 또는 업데이트
  Object.entries(newVNodeProps).forEach(([key, value]) => {
    if (!(key in oldVNodeProps)) {
      if (key.startsWith('on')) {
        const eventType = key.toLowerCase().substring(2);
        addEvent(targetEl, eventType, value);
      } else if (key === 'className') {
        targetEl.setAttribute('class', value);
      } else {
        targetEl.setAttribute(key, value);
      }
    } else {
      if (key.startsWith('on')) {
        const eventType = key.toLowerCase().substring(2);
        removeEvent(targetEl, eventType, value);
        addEvent(targetEl, eventType, value);
      } else if (key === 'className') {
        targetEl.removeAttribute('class');
        targetEl.setAttribute('class', value);
      } else {
        targetEl.removeAttribute(key);
        targetEl.setAttribute(key, value);
      }
    }
  });
}

// TODO: updateElement 함수 구현
function updateElement(parent, newVNode, oldVNode, index = 0) {
  const oldDomNode = parent.childNodes[index];
  if (!oldDomNode) return;

  // 1. 노드 제거 (newNode가 없고 oldNode가 있는 경우)
  // TODO: oldNode만 존재하는 경우, 해당 노드를 DOM에서 제거
  if (!newVNode && oldVNode) {
    return parent.removeChild(parent.childNodes[index]);
  }

  // 2. 새 노드 추가 (newNode가 있고 oldNode가 없는 경우)
  // TODO: newNode만 존재하는 경우, 새 노드를 생성하여 DOM에 추가
  if (newVNode && !oldVNode) {
    return parent.appendChild(createElement__v2(newVNode));
  }

  // 3. 텍스트 노드 업데이트
  // TODO: newNode와 oldNode가 둘 다 문자열 또는 숫자인 경우
  // TODO: 내용이 다르면 텍스트 노드 업데이트
  if (typeof newVNode === 'string' || typeof oldVNode === 'string') {
    if (newVNode !== oldVNode) {
      return parent.replaceChild(document.createTextNode(newVNode), oldDomNode);
    }
    return;
  }

  // 4. 노드 교체 (newNode와 oldNode의 타입이 다른 경우)
  // TODO: 타입이 다른 경우, 이전 노드를 제거하고 새 노드로 교체
  if (newVNode.type !== oldVNode.type) {
    return parent.replaceChild(createElement__v2(newVNode), parent.childNodes[index]);
  }
  // 5. 같은 타입의 노드 업데이트
  // 5-1. 속성 업데이트
  // TODO: updateAttributes 함수를 호출하여 속성 업데이트
  updateAttributes(oldDomNode, newVNode.props, oldVNode.props);

  // 5-2. 자식 노드 재귀적 업데이트
  // TODO: newNode와 oldNode의 자식 노드들을 비교하며 재귀적으로 updateElement 호출
  // HINT: 최대 자식 수를 기준으로 루프를 돌며 업데이트
  const newVNodeChildren = newVNode.children || [];
  const oldVNodeChildren = oldVNode.children || [];
  const maxLength = Math.max(newVNodeChildren.length, oldVNodeChildren.length);

  for (let i = 0; i < maxLength; i++) {
    // 자식 노드가 있는지 확인하고 재귀적으로 업데이트
    if (i < oldDomNode.childNodes.length) {
      updateElement(oldDomNode, newVNodeChildren[i], oldVNodeChildren[i], i);
    } else if (newVNodeChildren[i]) {
      // 새로운 자식 노드가 있으면 추가
      oldDomNode.appendChild(createElement__v2(newVNodeChildren[i]));
    }
  }

  // 5-3. 불필요한 자식 노드 제거
  // TODO: oldNode의 자식 수가 더 많은 경우, 남은 자식 노드들을 제거
  while (oldDomNode.childNodes.length > newVNodeChildren.length) {
    oldDomNode.removeChild(oldDomNode.lastChild);
  }
}

// TODO: renderElement 함수 구현
export function renderElement(vNode, container) {
  // 최상위 수준의 렌더링 함수입니다.
  const newVNode = processVNode(vNode);
  const oldVNode = container.__vNode;

  if (!oldVNode) {
    container.appendChild(createElement__v2(newVNode));
  } else {
    if (JSON.stringify(newVNode) === JSON.stringify(oldVNode)) return;
    // - 이전 vNode와 새로운 vNode를 비교하여 업데이트
    updateElement(container, newVNode, oldVNode);
  }

  // - 최초 렌더링과 업데이트 렌더링 처리
  // 이벤트 위임 설정
  // TODO: 렌더링이 완료된 후 setupEventListeners 함수를 호출하세요.
  container.__vNode = newVNode;
  setupEventListeners(container);
}
